import React, { useState, useRef } from "react";
import { X, Camera, User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { name: string; avatar?: string } | null;
    onSave: (data: { name: string; avatar?: string }) => void;
}

// --- ProfileSettingsModal: Modal สำหรับแก้ไขข้อมูลส่วนตัว ---
export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen && user) {
            setName(user.name || "");
            setAvatar(user.avatar);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    // ฟังก์ชันจัดการการอัปโหลดรูปโปรไฟล์
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave({ name, avatar });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">แก้ไขข้อมูลส่วนตัว</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    {/* Avatar Upload (ส่วนอัปโหลดรูป) */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-28 h-28 rounded-full border-[6px] border-slate-50 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
                                {avatar ? (
                                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-slate-300">{name.charAt(0).toUpperCase() || "U"}</span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold">ชื่อแสดงผล</Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="pl-11 h-12 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                                    placeholder="ชื่อผู้ใช้"
                                />
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSave} className="w-full h-12 rounded-xl text-lg font-medium gap-2 bg-[#5B45FF] hover:bg-[#4a36db] shadow-lg shadow-indigo-200 mt-2">
                        <Save size={20} />
                        บันทึกการเปลี่ยนแปลง
                    </Button>
                </div>
            </div>
        </div>
    );
};
