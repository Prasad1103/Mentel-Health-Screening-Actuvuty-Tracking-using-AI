import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Play, Pause, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudioRecorderProps {
  onResult?: (text: string, file?: File) => void;
  onFileReady?: (file: File | null) => void;
  compact?: boolean;
}

export default function AudioRecorder({
  onResult,
  onFileReady,
  compact = false,
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const updateAudioUrl = (url: string | null) => {
    audioUrlRef.current = url;
    setAudioUrl(url);
  };

  const startRecording = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      setRecording(true);
      recordClip(stream);
    } catch {
      toast.error(
        "Microphone access was blocked.\n\nPlease allow microphone permission from browser settings.\n\nMicrophone usage is optional and only improves analysis accuracy."
      );
    } finally {
      setLoading(false);
    }
  };

  const recordClip = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, {
          type: "audio/webm",
        });

        // Preserve the raw file for multi-modal upload
        setAudioFile(file);
        onFileReady?.(file);

        // Create playback URL
        const url = URL.createObjectURL(blob);
        updateAudioUrl(url);

        // Also call legacy onResult for backwards compatibility
        onResult?.("Voice note attached", file);
        toast.success("Voice note recorded — review or send with your message");
      }
    };

    recorder.start();
    timeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 15000);
  };

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }, []);

  const clearAudio = () => {
    setAudioFile(null);
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    updateAudioUrl(null);
    setPlaying(false);
    onFileReady?.(null);
    onResult?.("", undefined);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [stopRecording]);

  return (
    <div className={`${compact ? "space-y-1" : "space-y-3"}`}>
      {/* Recording indicator */}
      {recording && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-primary">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Recording voice note
            </span>
            <span className="text-muted-foreground">Max 15s</span>
          </div>
          <div className="flex h-8 items-end gap-0.5">
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={index}
                className="w-full rounded-full bg-primary/50"
                style={{
                  height: `${18 + ((index * 13) % 28)}px`,
                  animation: `pulse ${0.8 + (index % 4) * 0.12}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio playback preview */}
      {audioFile && audioUrl && !recording && (
        <div className="flex items-center gap-2 rounded-lg border bg-secondary/30 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={togglePlayback}
            aria-label={playing ? "Pause voice playback" : "Play voice recording"}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              Voice note attached
            </p>
            <p className="text-[10px] text-muted-foreground">
              Ready to send with your message
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={clearAudio}
            aria-label="Remove voice note"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!recording ? (
          <Button
            type="button"
            variant={audioFile ? "secondary" : "outline"}
            size="icon"
            onClick={startRecording}
            disabled={loading}
            aria-label="Start voice recording"
            title={audioFile ? "Re-record voice note" : "Record a voice note"}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            aria-label="Stop voice recording"
            title="Stop voice recording"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
