
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Scenario, SessionFeedback, Language, SessionPhase, SmartCriteria } from '../types';
import { getSystemInstruction, UI_STRINGS } from '../constants';
import { createPcmBlob, decode, decodeAudioData } from '../services/audioHelper';

interface CoachSessionProps {
  scenario: Scenario;
  lang: Language;
  onFinish: (feedback: SessionFeedback) => void;
  onExit: () => void;
}

const CoachSession: React.FC<CoachSessionProps> = ({ scenario, lang, onFinish, onExit }) => {
  const [phase, setPhase] = useState<SessionPhase>(SessionPhase.COACHING);
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>(''); 
  const [sessionTime, setSessionTime] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  const strings = UI_STRINGS[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    let timer: any;
    if (isRecording && phase === SessionPhase.SIMULATION) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording, phase]);

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const connectToAI = async (currentPhase: SessionPhase) => {
    if (sessionPromiseRef.current) {
      try {
        const oldSession = await sessionPromiseRef.current;
        oldSession.close();
      } catch (e) {}
      sessionPromiseRef.current = null;
    }

    stopMedia();
    try {
      const constraints = {
        audio: true,
        video: currentPhase === SessionPhase.SIMULATION 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current && currentPhase === SessionPhase.SIMULATION) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media error:", err);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    audioCtxRef.current = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioCtxRef.current = outputAudioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    await audioCtxRef.current.resume();
    await outputAudioCtxRef.current.resume();
    
    const proactiveInstruction = getSystemInstruction(lang, currentPhase) + 
      `\n\nEscenario Seleccionado: ${scenario.title[lang]}.` +
      `\nDetalles del Escenario: ${scenario.description[lang]}.` +
      (currentPhase === SessionPhase.COACHING 
        ? `\nIMPORTANTE: Saluda al usuario inmediatamente de forma profesional. No esperes a que él hable primero.`
        : `\nIMPORTANTE: MANTENTE EN SILENCIO ABSOLUTO. Solo escucha.`);

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {}, 
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: proactiveInstruction,
      },
      callbacks: {
        onopen: () => {
          setIsRecording(true);
          const source = audioCtxRef.current!.createMediaStreamSource(streamRef.current!);
          const scriptProcessor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createPcmBlob(inputData);
            sessionPromise.then((session: any) => {
              if (session) session.sendRealtimeInput({ media: pcmBlob });
            }).catch(() => {});
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioCtxRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            setUserTranscript(prev => prev + " " + message.serverContent?.inputTranscription?.text);
          }

          if (currentPhase === SessionPhase.COACHING) {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioCtxRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioCtxRef.current, 24000, 1);
              const src = outputAudioCtxRef.current.createBufferSource();
              src.buffer = audioBuffer;
              src.connect(outputAudioCtxRef.current.destination);
              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(src);
              src.onended = () => sourcesRef.current.delete(src);
            }
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsRecording(false),
        onerror: () => setIsRecording(false)
      }
    });

    sessionPromiseRef.current = sessionPromise;
  };

  const stopSession = async () => {
    setIsRecording(false);
    const promise = sessionPromiseRef.current;
    sessionPromiseRef.current = null;
    if (promise) {
      try {
        const session = await promise;
        session.close();
      } catch (e) {}
    }
    stopMedia();
    sourcesRef.current.forEach(src => { try { src.stop(); } catch (e) {} });
    sourcesRef.current.clear();
  };

  const finalizeSimulation = async () => {
    setIsEnding(true);
    await stopSession();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Determinamos la metodología esperada según el escenario para guiar a la IA
    let expectedMethodology = "SBI & SMART";
    if (scenario.id === 'one-on-one') expectedMethodology = "GROW, Escucha Activa & Seguridad Psicológica";
    if (scenario.id === 'recognition') expectedMethodology = "SBI, Impacto & Valores";
    if (scenario.id === 'collaborator-feedback' || scenario.id === 'team-feedback') expectedMethodology = "SBI, SMART & Radical Candor";

    const analysisPrompt = `
      Actúa como un Coach Ejecutivo Senior de Nivel Mundial. Analiza la transcripción de un líder:
      Escenario: ${scenario.title[lang]}
      Descripción del Objetivo: ${scenario.description[lang]}
      Transcripción: "${userTranscript}"
      
      CRITERIOS DE EVALUACIÓN SEGÚN EL TIPO:
      - Si es "1 a 1": Evalúa Modelo GROW (Metas, Realidad, Opciones, Voluntad), Escucha Activa y Seguridad Psicológica.
      - Si es "Reconocimiento": Evalúa SBI, Impacto en Resultados/Objetivos y Alineación con Valores Corporativos.
      - Para todos: Objetivos SMART y Ética Profesional.

      Debes devolver UN OBJETO JSON con la siguiente estructura exacta.
      {
        "score": 0-100,
        "clarity": 0-100,
        "empathy": 0-100,
        "assertiveness": 0-100,
        "languageCorrectness": 0-100,
        "languageAppropriateness": 0-100,
        "communication": 0-100,
        "emotionalIntelligence": 0-100,
        "smartScore": 0-100,
        "verbalAnalysis": "resumen crítico",
        "emotionalAnalysis": "resumen emocional",
        "bodyLanguageAnalysis": "análisis basado en tono y pausas",
        "smartCriteria": {
          "specific": boolean,
          "measurable": boolean,
          "achievable": boolean,
          "relevant": boolean,
          "timeBound": boolean
        },
        "keyTakeaways": ["string"],
        "improvementAreas": ["string"],
        "actionPlan": ["pasos concretos ejecutivos"],
        "suggestions": ["sugerencias de mentoría"],
        "marketMethodology": "${expectedMethodology}",
        "obsceneLanguageDetected": boolean
      }
    `;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: analysisPrompt,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 4000 } 
        }
      });
      
      let feedbackData = JSON.parse(result.text || "{}");
      
      const defaultSmart: SmartCriteria = {
        specific: false,
        measurable: false,
        achievable: false,
        relevant: false,
        timeBound: false
      };

      const finalFeedback: SessionFeedback = {
        ...feedbackData,
        score: feedbackData.score ?? 0,
        clarity: feedbackData.clarity ?? 50,
        empathy: feedbackData.empathy ?? 50,
        assertiveness: feedbackData.assertiveness ?? 50,
        languageAppropriateness: feedbackData.languageAppropriateness ?? 50,
        smartScore: feedbackData.smartScore ?? 0,
        emotionalIntelligence: feedbackData.emotionalIntelligence ?? 50,
        smartCriteria: { ...defaultSmart, ...(feedbackData.smartCriteria || {}) },
        keyTakeaways: feedbackData.keyTakeaways || [],
        improvementAreas: feedbackData.improvementAreas || [],
        actionPlan: feedbackData.actionPlan || [],
        suggestions: feedbackData.suggestions || [],
        fillerWordCount: { "eh": 0 },
        obsceneLanguageDetected: !!feedbackData.obsceneLanguageDetected,
        marketMethodology: feedbackData.marketMethodology || expectedMethodology
      };

      onFinish(finalFeedback);
    } catch (err) {
      console.error("Error analizando simulación:", err);
      onExit();
    }
  };

  const getMethodologyCards = () => {
    const isEs = lang === 'es';
    if (scenario.id === 'recognition') {
      return [
        {
          title: 'SBI',
          icon: '📍',
          color: 'indigo',
          desc: isEs 
            ? 'Describe la Situación, el Comportamiento observado y el Impacto que generó para fundamentar el logro.' 
            : 'Describe the Situation, observed Behavior, and the Impact it generated to ground the achievement.'
        },
        {
          title: isEs ? 'RESULTADOS' : 'RESULTS',
          icon: '📊',
          color: 'emerald',
          desc: isEs 
            ? 'Conecta el logro con el impacto en Objetivos estratégicos y Resultados de negocio cuantificables.' 
            : 'Connect the achievement to the impact on strategic Objectives and quantifiable business Results.'
        },
        {
          title: isEs ? 'VALORES' : 'VALUES',
          icon: '💎',
          color: 'amber',
          desc: isEs 
            ? 'Resalta cómo la conducta del colaborador modela y fortalece los Valores y la Cultura de la empresa.' 
            : 'Highlight how the employee\'s behavior models and strengthens the company\'s Values and Culture.'
        }
      ];
    } else if (scenario.id === 'one-on-one') {
      return [
        {
          title: 'GROW',
          icon: '🌱',
          color: 'indigo',
          desc: isEs 
            ? 'Guía la charla por Metas (Goal), Realidad (Reality), Opciones (Options) y Voluntad (Will).' 
            : 'Guide the talk through Goals, Reality, Options, and Will.'
        },
        {
          title: isEs ? 'SEGURIDAD' : 'SAFETY',
          icon: '🛡️',
          color: 'emerald',
          desc: isEs 
            ? 'Crea Seguridad Psicológica. El colaborador debe sentirse seguro para ser vulnerable y honesto.' 
            : 'Build Psychological Safety. The employee must feel safe to be vulnerable and honest.'
        },
        {
          title: isEs ? 'ESCUCHA' : 'LISTENING',
          icon: '👂',
          color: 'amber',
          desc: isEs 
            ? 'Escucha Activa: Haz preguntas abiertas. El líder habla el 20% y el colaborador el 80%.' 
            : 'Active Listening: Ask open-ended questions. The leader speaks 20%, the employee 80%.'
        }
      ];
    }
    return [
      {
        title: 'SBI',
        icon: '📍',
        color: 'indigo',
        desc: isEs 
          ? 'Estructura tu mensaje en Situación, Comportamiento e Impacto para un feedback objetivo.' 
          : 'Structure your message into Situation, Behavior, and Impact for objective feedback.'
      },
      {
        title: 'SMART',
        icon: '🎯',
        color: 'emerald',
        desc: isEs 
          ? 'Define compromisos Específicos, Medibles, Alcanzables, Relevantes y definidos en el Tiempo.' 
          : 'Define commitments that are Specific, Measurable, Achievable, Relevant, and Time-bound.'
      },
      {
        title: isEs ? 'ÉTICA' : 'ETHICS',
        icon: '⚖️',
        color: 'amber',
        desc: isEs 
          ? 'Mantén el Profesionalismo, utiliza un tono asertivo y un lenguaje alineado a la cultura corporativa.' 
          : 'Maintain Professionalism, use an assertive tone, and language aligned with corporate culture.'
      }
    ];
  };

  const cards = getMethodologyCards();

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white overflow-hidden font-inter">
      <div className="flex items-center justify-between px-8 py-5 bg-[#0f172a] border-b border-white/5 shadow-2xl z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={onExit} 
            disabled={isRecording}
            className={`p-2 hover:bg-white/10 rounded-xl transition-all ${isRecording ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className={`flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5 ${isRecording ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
            <button 
              onClick={() => { setPhase(SessionPhase.COACHING); }}
              disabled={isRecording}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phase === SessionPhase.COACHING ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
              {strings.phaseCoaching}
            </button>
            <button 
              onClick={() => { setPhase(SessionPhase.SIMULATION); }}
              disabled={isRecording}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phase === SessionPhase.SIMULATION ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
              {strings.phaseSimulation}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {phase === SessionPhase.SIMULATION && isRecording && (
            <div className="flex items-center gap-3 bg-black/30 px-5 py-2.5 rounded-2xl border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xl font-bold tracking-tighter">
                {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
          
          {isRecording && (
            <button 
              onClick={phase === SessionPhase.COACHING ? stopSession : finalizeSimulation} 
              disabled={isEnding} 
              className="px-8 py-2.5 bg-red-500 hover:bg-red-600 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/20"
            >
              {isEnding ? strings.sessionAnalyzing : (phase === SessionPhase.COACHING ? strings.sessionEndCoaching : strings.sessionEnd)}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-hidden">
        <div className="h-full w-full relative bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
          <div className="h-full w-full">
            {phase === SessionPhase.COACHING ? (
              <div className="flex items-center justify-center h-full bg-slate-950">
                 <div className={`w-64 h-64 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative ${isRecording ? 'animate-pulse' : ''}`}>
                    <div className="text-6xl">🎙️</div>
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
                        <div className="absolute -inset-4 rounded-full border border-indigo-500/10 animate-pulse" />
                      </>
                    )}
                 </div>
                 <div className="absolute bottom-12 left-12 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                      {isRecording ? 'Modo Mentoría Activo (Solo Audio)' : 'Mentoría Lista'}
                   </span>
                 </div>
              </div>
            ) : (
              <div className="relative h-full w-full bg-slate-950 flex items-center justify-center">
                 <div className="w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden border border-white/10 relative group shadow-2xl">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-10 left-10">
                       <h3 className="text-2xl font-black uppercase tracking-widest text-emerald-400">{strings.simulationTarget}</h3>
                       <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] mt-2">ANÁLISIS GESTUAL Y VERBAL ACTIVO</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
          
          {!isRecording && !isEnding && (
            <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl flex items-center justify-center p-8 z-30">
              <div className="max-w-6xl w-full animate-in zoom-in duration-500">
                
                {phase === SessionPhase.COACHING ? (
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Metodología Recomendada</div>
                    <h3 className="text-5xl font-black mb-16 tracking-tighter text-center">{scenario.title[lang]}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
                      {cards.map((card, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all hover:-translate-y-2 group">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform ${
                            card.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400' :
                            card.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {card.icon}
                          </div>
                          <h4 className={`text-xl font-black mb-4 uppercase tracking-widest ${
                            card.color === 'indigo' ? 'text-indigo-400' :
                            card.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {card.title}
                          </h4>
                          <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            {card.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-[2.5rem] flex items-center justify-center text-5xl mb-12 mx-auto shadow-2xl shadow-indigo-500/20">👤</div>
                    <h3 className="text-5xl font-black mb-8 tracking-tighter leading-none">{strings.sessionReady}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed font-medium mb-4">{strings.sessionReadyDesc}</p>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] bg-emerald-500/10 px-4 py-2 rounded-full inline-block">Cámara y Audio Requeridos</div>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <button onClick={() => connectToAI(phase)} className="bg-white text-slate-900 px-16 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-white/10">
                    {strings.sessionInitialize}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEnding && (
             <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center text-center p-12 z-50">
               <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in">
                  <div className="relative mb-12">
                    <div className="w-24 h-24 border-4 border-white/5 rounded-full" />
                    <div className="absolute inset-0 w-24 h-24 border-t-4 border-indigo-500 rounded-full animate-spin" />
                  </div>
                  <h3 className="text-4xl font-black mb-6 tracking-tighter">Generando Reporte</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">Analizando desempeño verbal y gestual...</p>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachSession;
