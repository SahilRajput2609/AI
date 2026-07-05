import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

interface LoginScreenProps {
  onLogin: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.1,
        targetAlpha: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw very faint connection lines
      ctx.strokeStyle = "rgba(204, 163, 116, 0.03)";
      ctx.lineWidth = 0.5;

      particles.forEach((p, idx) => {
        // Handle mouse gesture interaction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 220) {
            const force = (220 - dist) / 220;
            p.vx += (dx / dist) * force * 0.04;
            p.vy += (dy / dist) * force * 0.04;
            // Cap speed
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.2) {
              p.vx = (p.vx / speed) * 1.2;
              p.vy = (p.vy / speed) * 1.2;
            }
            p.targetAlpha = 0.8;
          } else {
            p.targetAlpha = p.alpha;
          }
        } else {
          p.targetAlpha = p.alpha;
        }

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Move
        p.x += p.vx + (Math.random() - 0.5) * 0.05;
        p.y += p.vy + (Math.random() - 0.5) * 0.05;

        // Bounce/Wrap borders
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Animate alpha
        const diff = p.targetAlpha - p.alpha;
        p.alpha += diff * 0.05;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(204, 163, 116, ${p.alpha})`;
        ctx.shadowColor = "#cca374";
        ctx.shadowBlur = p.alpha > 0.6 ? 4 : 0;
        ctx.fill();

        // Connect nearby particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setLoginError('');
    try {
      const status = await api.getStatus()
      if (status.status === 'running') {
        await new Promise(r => setTimeout(r, 600))
        onLogin()
      } else {
        setLoginError('Server is not ready. Please try again.')
      }
    } catch {
      setLoginError('Could not connect to server. Make sure the server is running.')
    }
    setIsLoading(false)
  };

  return (
    <div 
      className="min-h-screen bg-black flex items-center justify-center p-0 relative overflow-hidden font-sans select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Interactive Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Main Container: Split-Pane Card */}
      <div className="w-full max-w-4xl h-[580px] rounded-xl border border-white/5 bg-zinc-950/60 backdrop-blur-md flex overflow-hidden z-10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] max-md:max-w-md max-md:h-auto max-md:flex-col m-4">
        
        {/* Left Pane: The Form */}
        <div className="flex-1 p-10 flex flex-col justify-between max-md:p-8">
          
          {/* Logo & Subheading */}
          <div>
            <div className="flex items-center gap-2.5">
              {/* Premium Geometric Sand-Gold Logo */}
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="transform hover:rotate-45 transition-transform duration-500">
                <path d="M16 2L30 26H2L16 2Z" stroke="#cca374" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M16 11L23 23H9L16 11Z" fill="#cca374" opacity="0.3" />
                <circle cx="16" cy="18" r="2" fill="#cca374" />
              </svg>
              <span className="text-sm font-bold text-white tracking-widest uppercase font-mono">
                AI-Agency
              </span>
            </div>
            
            <h2 className="mt-8 text-xl font-medium text-white tracking-tight">
              Access the Workspace
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Enter credentials to establish connection.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 my-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">
                  Identity Address
                </label>
                {emailError && (
                  <span className="text-[10px] text-red-400/90 font-medium">
                    {emailError}
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-2.5 rounded-lg border bg-zinc-900/40 px-3.5 py-2.5 transition-all duration-300 ${emailError ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 focus-within:border-zinc-700 focus-within:bg-zinc-900/80'}`}>
                <Mail size={15} className={emailError ? 'text-red-400/70' : 'text-zinc-500'} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  disabled={isLoading}
                  placeholder="identity@ai-agency.com"
                  className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">
                  Authorization Key
                </label>
                {passwordError && (
                  <span className="text-[10px] text-red-400/90 font-medium">
                    {passwordError}
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-2.5 rounded-lg border bg-zinc-900/40 px-3.5 py-2.5 transition-all duration-300 ${passwordError ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 focus-within:border-zinc-700 focus-within:bg-zinc-900/80'}`}>
                <Lock size={15} className={passwordError ? 'text-red-400/70' : 'text-zinc-500'} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-2 text-zinc-500 hover:text-zinc-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-white/10 bg-zinc-900/40 text-[#cca374] focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                />
                Persist session
              </label>
              <a href="#" className="text-zinc-500 hover:text-[#cca374] transition-colors">
                Forgot credentials?
              </a>
            </div>

            {loginError && (
              <div className="text-red-400 text-[11px] text-center mt-3">{loginError}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 rounded-lg bg-[#cca374] text-black font-semibold py-2.5 text-xs hover:bg-[#e2cca8] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Initialize Portal</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          {/* Footer Social Connects */}
          <div className="flex gap-2 max-md:mt-4">
            <button className="flex-1 flex items-center justify-center gap-2 border border-white/5 bg-zinc-900/20 rounded-lg py-2 hover:bg-zinc-900/80 hover:border-white/10 text-[11px] text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-white/5 bg-zinc-900/20 rounded-lg py-2 hover:bg-zinc-900/80 hover:border-white/10 text-[11px] text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.988 0-.746-.08-1.32-.176-1.888H12.24z"/>
              </svg>
              Google
            </button>
          </div>

        </div>

        {/* Right Pane: Premium Abstract Graphic Cover */}
        <div className="flex-1 bg-zinc-900 relative flex flex-col justify-end p-10 overflow-hidden max-md:hidden border-l border-white/5">
          {/* Generated Image Background */}
          <img 
            src="/login_graphic.png" 
            alt="Branding Abstract" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-75 select-none pointer-events-none"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />
          
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-[#cca374] uppercase tracking-widest font-mono">
              Agent Orchestration Platform
            </span>
            <h1 className="text-2xl font-medium text-white tracking-tight mt-2 max-w-sm">
              The premium hub for specialized AI workgroups.
            </h1>
            <p className="text-[11px] text-zinc-400 mt-2 max-w-sm font-sans leading-relaxed">
              Design workflows, track progress, review outputs, and manage agent logic from a unified, minimal workspace.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}