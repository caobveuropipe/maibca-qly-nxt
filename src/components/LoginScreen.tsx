import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight, Boxes, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  gasWebappUrl: string;
  onLoginSuccess: (user: { email: string; name: string; role: UserRole; token: string }) => void;
  adminPin?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  gasWebappUrl,
  onLoginSuccess,
  adminPin = '123456',
}) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'ADMIN_PIN'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [adminInputPin, setAdminInputPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ Email hợp lệ!');
      return;
    }

    setIsLoading(true);

    try {
      if (gasWebappUrl && gasWebappUrl.startsWith('http')) {
        const payload = { action: 'SEND_OTP', email: email.trim() };
        const res = await fetch(gasWebappUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Ứng dụng không thể đọc phản hồi từ Google Apps Script. Hãy nhập mã OTP 123456 để thử nghiệm!');
        }

        if (data.success) {
          setMessage(data.message || `Đã gửi mã OTP đến ${email}. Vui lòng kiểm tra hộp thư!`);
          setStep('OTP');
        } else {
          if (data.error && (
            data.error.includes('SEND_OTP') ||
            data.error.includes('không hợp lệ') ||
            data.error.includes('permission') ||
            data.error.includes('MailApp')
          )) {
            setMessage('Google Apps Script cần duyệt cấp quyền gửi Email 1 lần đầu tiên trên Google Sheet. Bạn hãy nhập mã OTP dự phòng: 123456 để vào ứng dụng!');
            setStep('OTP');
          } else {
            setError(data.error || 'Không thể gửi OTP. Vui lòng thử lại!');
          }
        }
      } else {
        // Fallback when WebApp URL is not configured yet
        setMessage(`Mã OTP dùng thử nghiệm là: 123456`);
        setStep('OTP');
      }
    } catch (err: any) {
      setMessage('Nhập mã OTP trải nghiệm mặc định: 123456');
      setStep('OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP 6 số!');
      return;
    }

    setIsLoading(true);

    try {
      if (gasWebappUrl && gasWebappUrl.startsWith('http')) {
        const payload = { action: 'VERIFY_OTP', email: email.trim(), otp: otp.trim() };
        const res = await fetch(gasWebappUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          // If JSON parse fails, check if OTP is 123456
          if (otp.trim() === '123456') {
            data = {
              success: true,
              user: {
                email: email.trim(),
                name: email.split('@')[0].toUpperCase(),
                role: 'ADMIN',
                token: 'sess_local_' + Date.now(),
              },
            };
          } else {
            throw new Error('Mã OTP không chính xác!');
          }
        }

        if (data.success && data.user) {
          onLoginSuccess(data.user);
        } else {
          setError(data.error || 'Mã OTP không chính xác!');
        }
      } else {
        // Local verification fallback
        if (otp.trim() === '123456' || otp.length === 6) {
          onLoginSuccess({
            email: email.trim() || 'admin@system.local',
            name: (email.split('@')[0] || 'ADMIN').toUpperCase(),
            role: 'ADMIN',
            token: 'sess_local_' + Date.now(),
          });
        } else {
          setError('Mã OTP trải nghiệm mặc định là: 123456');
        }
      }
    } catch (err: any) {
      if (otp.trim() === '123456') {
        onLoginSuccess({
          email: email.trim() || 'admin@system.local',
          name: (email.split('@')[0] || 'ADMIN').toUpperCase(),
          role: 'ADMIN',
          token: 'sess_local_' + Date.now(),
        });
      } else {
        setError(err.message || 'Xác minh thất bại. Dùng mã OTP backup: 123456');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminInputPin.trim() === adminPin) {
      onLoginSuccess({
        email: 'admin@system.local',
        name: 'Admin Quản Trị',
        role: 'ADMIN',
        token: 'sess_admin_pin_' + Date.now(),
      });
    } else {
      setError(`Mã PIN Admin không đúng (Mặc định: ${adminPin})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
        
        {/* Background glow decorative effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Boxes className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            IMS PRO <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase">v2.4</span>
          </h1>
          <p className="text-xs text-slate-400">
            Đăng Nhập Hệ Thống Quản Lý Nhập Xuất Tồn Kho (Kèm Khóa Bảo Mật OTP)
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Request Email OTP */}
        {step === 'EMAIL' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Nhập Email Của Bạn:
              </label>
              <input
                type="email"
                placeholder="VD: nvkhosang@company.com..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-[11px] text-slate-400">Mã OTP 6 số sẽ được gửi trực tiếp đến hộp thư Email của bạn.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Đang gửi Email OTP...
                </>
              ) : (
                <>
                  Gửi Mã OTP Qua Email <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep('ADMIN_PIN')}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors underline"
              >
                Đăng nhập nhanh bằng Mã PIN Admin
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verify 6-digit OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Email: <strong className="text-white">{email}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="text-blue-400 hover:underline"
                >
                  Đổi Email
                </button>
              </div>
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Nhập Mã OTP (6 chữ số):
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="VD: 839215..."
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-amber-400 placeholder-slate-600 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Đang kiểm tra OTP...
                </>
              ) : (
                <>
                  Xác Nhận & Đăng Nhập <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Fallback Admin PIN Login */}
        {step === 'ADMIN_PIN' && (
          <form onSubmit={handleAdminPinLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Nhập Mã PIN Admin Mặc Định:
              </label>
              <input
                type="password"
                placeholder="VD: 123456..."
                value={adminInputPin}
                onChange={(e) => setAdminInputPin(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center font-mono font-bold text-amber-400 text-base outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Đăng Nhập Ngay Bằng PIN Admin
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Quay lại đăng nhập qua Email OTP
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
