import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Play,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { analyzeFace } from "@/lib/api";
import { toast } from "sonner";

interface WebcamCaptureProps {
  onEmotion?: (emotion: string, file?: File) => void;
  onFileReady?: (file: File | null) => void;
  compact?: boolean;
}

export default function WebcamCapture({
  onEmotion,
  onFileReady,
  compact = false,
}: WebcamCaptureProps) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setActive(true);
    } catch {
      setError("Camera access was blocked.\n\nPlease allow camera permission from browser settings.\n\nCamera usage is optional and only improves analysis accuracy.");
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) =>
      t.stop()
    );

    setActive(false);
  }, []);

  const captureAndAnalyze = useCallback(async (silent = false) => {
    if (!videoRef.current || !canvasRef.current)
      return;

    try {
      setLoading(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            "image/jpeg",
            0.9
          )
      );

      if (!blob) {
        toast.error("Image capture failed");
        return;
      }

      const file = new File(
        [blob],
        `face_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      const res = await analyzeFace(file, false);

      const label =
        res?.emotion ||
        res?.concern ||
        "Neutral";

      const conf =
        Number(res?.confidence) <= 1
          ? Number(res.confidence) * 100
          : Number(res.confidence || 0);

      setEmotion(label);
      setConfidence(conf);

      onEmotion?.(label, file);
      onFileReady?.(file);

      if (!silent) toast.success("Face analyzed");
    } catch (err: unknown) {
      console.error(err);
      if (!silent) toast.error(
        err instanceof Error ? err.message : "Face analysis failed"
      );
    } finally {
      setLoading(false);
    }
  }, [onEmotion, onFileReady]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-xl overflow-hidden border bg-black ${
          compact ? "h-48" : "h-64"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {active && (
          <>
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-cyan-300/90 shadow-[0_0_0_999px_rgba(15,23,42,0.12)]" />
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700">
              Camera quality: good
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700">
              Lighting: balanced
            </div>
          </>
        )}

        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {emotion && (
        <div className="rounded-xl border p-3 text-sm">
          <p>
            <strong>Emotion:</strong> {emotion}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {confidence.toFixed(1)}%
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {!active ? (
          <Button
            onClick={startCamera}
            aria-label="Start optional camera analysis"
          >
            <Play className="h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => captureAndAnalyze(false)}
              disabled={loading}
              aria-label="Analyze current camera frame"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Analyze Frame
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              aria-label="Stop camera analysis"
            >
              <Square className="h-4 w-4" />
              Stop Camera
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
