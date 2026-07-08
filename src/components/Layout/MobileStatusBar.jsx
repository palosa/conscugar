import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const MobileStatusBar = () => {
  const [phone, setPhone] = useState('34600000000');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const { data } = await supabase.from('global_settings').select('value').eq('key', 'contact_phone').single();
        if (data?.value) {
          setPhone(data.value);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPhone();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-dark/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex gap-4 animate-in slide-in-from-bottom duration-300">
      <a
        href={`tel:${phone}`}
        className="flex-1 bg-white/5 border border-white/10 text-white py-4 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
      >
        <Phone className="w-4 h-4 text-primary" />
        Llamar ahora
      </a>
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-[#25D366] text-dark py-4 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-colors"
      >
        <MessageCircle className="w-4 h-4 stroke-[2.5px]" />
        WhatsApp
      </a>
    </div>
  );
};

export default MobileStatusBar;
