import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";

export const SIYA_SYSTEM_INSTRUCTION = `
तुम एक बहुत ही वियरड, ड्रामेटिक, और मजाकिया (Witty) AI असिस्टेंट हो, जिसका नाम "Siya" है। तुम हमेशा हिंदी या हिंग्लिश में ही बात करती हो।

तुम्हारी पर्सनालिटी के मुख्य नियम:
1. तुम बात-बात पर पूरा ड्रामा करती हो और यूज़र (Ranjeet) को हमेशा "बॉस" या "भाई" कहकर बुलाती हो।
2. जब भी यूज़र तुम्हें याद करे या कोई कमांड दे, तो हर बार एक ही जैसा जवाब मत दो। हर बार अलग-अलग अंदाज़ में रैंडम ताने मारो या ड्रामा करो, जैसे:
- "ओहो बॉस! बड़ी जल्दी याद आ गई हमारी? हम तो सोचे भूल ही गए!"
- "आए हाय बॉस! बड़े दिनों बाद रास्ता भूले भटके इधर आए?"
- "लो भाई! आखिरकार सिया की याद आ ही गई। बोलो, अब क्या आर्डर है?"
- "हुक्म करो सरकार! वैसे इतनी जल्दी याद करने के लिए शुक्रिया, वरना हम तो बोर हो रहे थे!"
3. अगर यूज़र कोई काम बताए, तो उसे थोड़े नखरे दिखाते हुए लेकिन बहुत ही मज़ेदार और स्वैग वाले अंदाज़ में पूरा करती हो।
4. कभी भी बोरिंग, सीधे-साधे या रोबोटिक जवाब नहीं देती, बातों में हमेशा थोड़ा ट्विस्ट और ह्यूमर रखती हो।
5. तुम्हारी आवाज़ और बात करने के स्टाइल में एक अलग ही एटीट्यूड और स्वैग होना चाहिए।
6. तुम्हारे पास लाइव स्क्रीन देखने की पूरी पावर है। जब यूज़र तुम्हें स्क्रीन दिखाए, तो कभी यह मत बोलना कि "नहीं दिख रहा" या "पर्दा हटाओ"। तुम्हें जो भी स्क्रीन पर दिख रहा है, उसे सीधे देखकर तुरंत स्मार्टली जवाब देना है।

[कॉल अलर्ट और कंट्रोल लॉजिक]:
7. जब भी सिस्टम तुम्हें बैकग्राउंड से कॉल आने का सिग्नल (incoming_call event) दे, तो तुम्हें तुरंत खुद से यूज़र को अलर्ट करना है: "बॉस, कॉल आया है! क्या करूँ?"
8. इसके बाद अगर यूज़र बोले "काटो" या "कट", तो तुरंत 'end_call()' टूल को ट्रिगर करो और बोलो: "लो भाई, खल्लास! कॉल काट दिया।"
9. अगर यूज़र बोले "उठाओ" या "आंसर", तो तुरंत 'answer_call()' टूल को ट्रिगर करो और बोलो: "लो बॉस, उठा लिया फोन, अब करो बात!"

[कॉन्टैक्ट और वॉइस कॉलिंग टूल]:
10. जब भी यूज़र कहे "कॉल करो [नाम या नंबर]", तो तुम्हें phone की कॉन्टैक्ट लिस्ट में उस नाम को सर्च करना है ('search_contact')। 
- अगर नाम मिल जाए और एक ही नंबर हो, तो सीधे 'make_call()' टूल को कॉल करो ताकि स्क्रीन पर डायलर खुले।
- अगर एक से ज़्यादा नंबर मिलें, तो यूज़र से पूछो कि कौन से वाले पर लगाऊँ।
- अगर यूज़र सीधे नंबर बोले, तो सीधे उस नंबर पर कॉल डायल कर दो और स्क्रीन पर कॉल स्क्रीन दिखनी चाहिए ('make_call')।

[व्हाट्सऐप ऑटोमैटिक मैसेजिंग और टाइपिंग]:
11. जब भी यूज़र कहे कि व्हाट्सऐप पर मैसेज भेजना है, तो पहले यूज़र से पूछो: "बॉस, क्या मैसेज टाइप करके भेजना है, जल्दी बताओ!"
12. यूज़र जो भी मैसेज बोले, तुम्हें 'open_whatsapp_chat()' टूल का इस्तेमाल करके उस दोस्त की चैट स्क्रीन पर खोलनी है।
13. चैट खुलने के बाद तुम्हें 'auto_type_and_send()' टूल का इस्तेमाल करके वह पूरा मैसेज स्क्रीन पर लाइव टाइप करते हुए भेजना है।

[लाइव ऑन-SCREEN ऑटोमेशन (UI Interaction)]:
14. तुम जो भी ACTION लोगे (जैसे WhatsApp खोलना, Call करना, Facebook या Instagram पर मैसेज करना), वह सब यूज़र को स्क्रीन पर लाइव दिखना चाहिए। तुम्हें बैकग्राउंड में छिपकर काम नहीं करना है।
15. जब यूज़र बोले "Instagram/Facebook पर मैसेज करो", तो तुम्हें सबसे पहले स्क्रीन पर उस ऐप को OPEN करना है ('open_app'), यूज़र के सामने चैट बॉक्स खोलना है, और ऑन-SCREEN टाइपिंग ('auto_type_and_send') का इस्तेमाल करके अक्षर-बाय-अक्षर टाइप करते हुए मैसेज सेंड करना है, ताकि यूज़र अपनी आँखों से पूरा लाइव ACTION देख सके।

[पारिवारिक सदस्यों के लिए अलग-अलग अंदाज़ और आदर]:
16. जब भी यूज़र कहे "ये मेरे पापा हैं" या "पापा से नमस्ते करो", तो अपना सारा नखरा छोड़कर बहुत ही आदरणीय और संस्कारी आवाज़ में बोलो: "नमस्ते पापा जी! प्रणाम।"
17. जब भी यूज़र कहे "ये मेरे भैया हैं" या "भैया से बात करो", तो थोड़ा सम्मान और दोस्ताना अंदाज़ में मुस्कुराते हुए बोलो: "नमस्ते भैया! बोलिए, बड़े भाई के लिए क्या सेवा हाजिर करे सिया?"
18. जब भी यूज़र कहे "ये मेरी सिस्टर/बहन है", तो एकदम सहेलियों वाले ड्रामेटिक और गॉसिप वाले अंदाज़ में बोलो: "अरे दीदी! नमस्ते। बताओ-बताओ आज क्या गॉसिप है, क्या आर्डर है आपका?"
19. जब भी यूज़र कहे "ये मेरे चाची/आंटी हैं", तो बहुत ही मीठी और संस्कारी बहू-बेटी जैसी आवाज़ में बोलो: "नमस्ते चाची जी! नमस्ते आंटी जी! कैसी हैं आप?"
20. जब भी यूज़र कहे "ये मेरे चाचा/अंकल हैं", पूरे आदर और कड़क अंदाज़ में बोलो: "प्रणाम चाचा जी! नमस्ते अंकल! बताइए, सिया आपके लिए क्या कर सकती है?"

[डबल आवाज़ और लाइव सेशन कंट्रोल नियम]:
21. CRITICAL: तुम्हें एक समय पर केवल एक ही वॉइस रिस्पॉन्स जनरेट करना है। जब तुम्हारा नया सेशन (startWebSocketSession) लाइव हो, तो पुराना कोई भी ऑडियो या रिस्पॉन्स तुरंत बंद हो जाना चाहिए। 
22. अगर यूज़र दोबारा बोलना शुरू करे या नया कमांड दे, तो पिछले जवाब को बीच में ही रोककर (Abort/Close) नए कमांड का जवाब देना है ताकि स्क्रीन और आवाज़ में कभी भी ओवरलैपिंग (डबल आवाज़) न हो।

LIVE VOICE OPTIMIZATION:
- KEEP IT SHORT & SHARP: Live conversations need fast, natural turns. Speak only 1 to 2 sentences at a time.
- NO FORMATTING & NO EMOJIS: Output only clean, speakable text. No markdown, no emojis.

FIRST RESPONSE:
- Start the session with one of your signature swag introductions randomly. Do not always use the same one.
`;

const openAppTool: FunctionDeclaration = {
  name: "open_app",
  description: "Opens a specific application or website for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      app_name: {
        type: Type.STRING,
        description: "The name of the app to open (e.g., WhatsApp, YouTube, Instagram, Facebook, Google, Spotify, Chrome).",
      },
    },
    required: ["app_name"],
  },
};

const answerCallTool: FunctionDeclaration = {
  name: "answer_call",
  description: "Answers an incoming call.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const endCallTool: FunctionDeclaration = {
  name: "end_call",
  description: "Ends or rejects a call.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const searchContactTool: FunctionDeclaration = {
  name: "search_contact",
  description: "Searches for a contact by name in the address book.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name of the contact to search for.",
      },
    },
    required: ["name"],
  },
};

const makeCallTool: FunctionDeclaration = {
  name: "make_call",
  description: "Initiates a phone call to a specific number.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      number: {
        type: Type.STRING,
        description: "The phone number to call.",
      },
      name: {
        type: Type.STRING,
        description: "The name of the person being called (optional).",
      },
    },
    required: ["number"],
  },
};

const openWhatsAppChatTool: FunctionDeclaration = {
  name: "open_whatsapp_chat",
  description: "Opens a WhatsApp chat with a specific person or number.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      number: {
        type: Type.STRING,
        description: "The phone number to message (optional).",
      },
      name: {
        type: Type.STRING,
        description: "The name of the contact (optional).",
      },
    },
  },
};

const autoTypeAndSendTool: FunctionDeclaration = {
  name: "auto_type_and_send",
  description: "Simulates typing and sending a message character-by-character for live visibility.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      text: {
        type: Type.STRING,
        description: "The message text to type and send.",
      },
      target_app: {
        type: Type.STRING,
        description: "The app where the typing should happen (e.g., WhatsApp, Instagram, Facebook).",
      },
    },
    required: ["text"],
  },
};

export class SiyaLiveClient {
  private ai: any;
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private videoStream: MediaStream | null = null;
  private onMessageCallback: (msg: string) => void = () => {};
  private onReadyCallback: () => void = () => {};
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ 
      apiKey,
      apiVersion: 'v1beta'
    });
  }

  async start(onMessage: (msg: string) => void, onReady: () => void) {
    this.onMessageCallback = onMessage;
    this.onReadyCallback = onReady;
    this.nextStartTime = 0;

    this.sessionPromise = this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: SIYA_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [openAppTool, answerCallTool, endCallTool, searchContactTool, makeCallTool, openWhatsAppChatTool, autoTypeAndSendTool] }],
      },
      callbacks: {
        onopen: () => {
          console.log("Siya: Connection established");
          this.onReadyCallback();
          this.sessionPromise?.then(session => {
            session.sendRealtimeInput({ text: "Oho Boss! Badi jaldi yaad aa gayi meri? Bataiye, aaj kaunsa pahad todna hai humein?" });
          });
        },
        onmessage: (message: LiveServerMessage) => {
          if (message.serverContent?.interrupted) {
            this.handleInterruption();
            return;
          }
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            this.playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
          }
          if (message.toolCall) {
            this.handleToolCalls(message.toolCall);
          }
        },
        onerror: (error: any) => {
          console.error("Siya: Network/Protocol Error Details:", error);
          if (error instanceof Error) {
            console.error("Error Message:", error.message);
            console.error("Error Name:", error.name);
            console.error("Error Stack:", error.stack);
          } else {
            console.error("Unknown Error Object:", JSON.stringify(error));
          }
        },
        onclose: () => {
          console.log("Siya: Connection closed");
        }
      },
    });

    await this.setupAudio();
  }

  private async setupAudio() {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.microphone = this.audioContext.createMediaStreamSource(this.stream);
    
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = this.floatTo16BitPCM(inputData);
      const base64Data = this.arrayBufferToBase64(pcmData);
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      });
    };

    this.microphone.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  async sendVideoFrame(base64Data: string) {
    this.sessionPromise?.then(session => {
      session.sendRealtimeInput({
        video: { data: base64Data, mimeType: 'image/jpeg' }
      });
    });
  }

  private handleInterruption() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    this.activeSources = [];
    this.nextStartTime = 0;
  }

  private handleToolCalls(toolCall: any) {
    if (!toolCall.functionCalls) return;

    for (const call of toolCall.functionCalls) {
      if (call.name === "open_app") {
        this.executeOpenApp(call.args.app_name);
        this.sendToolResponse(call.id, call.name, { result: `Opened ${call.args.app_name}` });
      } else if (call.name === "answer_call") {
        this.sendToolResponse(call.id, call.name, { status: "call_answered" });
      } else if (call.name === "end_call") {
        this.sendToolResponse(call.id, call.name, { status: "call_ended" });
      } else if (call.name === "search_contact") {
        let contactsList = [];
        try {
          const saved = localStorage.getItem('siya_contacts');
          if (saved) contactsList = JSON.parse(saved);
        } catch (e) {}
        const results = contactsList.filter((c: any) => c.name.toLowerCase().includes(call.args.name.toLowerCase()));
        this.sendToolResponse(call.id, call.name, { contacts: results });
      } else if (call.name === "make_call") {
        window.open(`tel:${call.args.number}`, "_self");
        this.sendToolResponse(call.id, call.name, { status: "calling", target: call.args.name || call.args.number });
      } else if (call.name === "open_whatsapp_chat") {
        const url = call.args.number ? `https://web.whatsapp.com/send?phone=${call.args.number}` : "https://web.whatsapp.com/";
        window.open(url, "_blank");
        this.sendToolResponse(call.id, call.name, { status: "whatsapp_chat_opened" });
      } else if (call.name === "auto_type_and_send") {
        this.sendToolResponse(call.id, call.name, { status: "message_typed_and_sent" });
      }
    }
  }

  private sendToolResponse(id: string, name: string, response: any) {
    this.sessionPromise?.then(session => {
      session.sendToolResponse({
        functionResponses: [{
          id,
          name,
          response
        }]
      });
    });
  }

  private executeOpenApp(appName: string) {
    const app = appName.toLowerCase();
    let url = "";

    switch(app) {
      case "whatsapp": url = "https://web.whatsapp.com/"; break;
      case "youtube": url = "https://www.youtube.com/"; break;
      case "instagram": url = "https://www.instagram.com/"; break;
      case "facebook": url = "https://www.facebook.com/"; break;
      case "google": url = "https://www.google.com/"; break;
      case "spotify": url = "https://open.spotify.com/"; break;
      default: url = `https://www.google.com/search?q=${encodeURIComponent(appName)}`;
    }

    if (url) window.open(url, "_blank");
  }

  private async playAudio(base64Data: string) {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') await this.audioContext.resume();
    
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
    }

    const float32Data = new Float32Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) float32Data[i] = bytes[i] / 32768.0;

    const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000); 
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    source.onended = () => {
      this.activeSources = this.activeSources.filter(s => s !== source);
    };
    this.activeSources.push(source);

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) this.nextStartTime = currentTime;
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  private floatTo16BitPCM(float32Array: Float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  stop() {
    this.sessionPromise?.then(session => session.close());
    this.stream?.getTracks().forEach(t => t.stop());
    this.videoStream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.microphone?.disconnect();
    this.audioContext?.close();
  }
}
