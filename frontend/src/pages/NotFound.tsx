import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-background">
      <div className="relative text-center max-w-md animate-fade-up">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-6">
          <Brain className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-7xl sm:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="font-display text-2xl font-bold mb-3">Signal lost</h2>
        <p className="text-muted-foreground mb-8">
          We couldn't find the page you're looking for. Let's get you back to the analysis.
        </p>
        <Button size="lg" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
