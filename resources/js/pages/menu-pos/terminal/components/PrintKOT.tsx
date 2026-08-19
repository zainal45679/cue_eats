import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function PrintKOT({ kot, onPrinted }: { kot: any, onPrinted?: () => void }) {
    const { organization } = usePage().props as any;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (kot && mounted) {
            const timer = setTimeout(() => {
                window.print();
                if (onPrinted) onPrinted();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [kot, mounted]);

    if (!kot || !mounted) return null;

    const formattedTime = kot.created_at 
        ? new Date(kot.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const content = (
        <div id="thermal-print-root" className="text-black bg-white w-full max-w-[80mm] text-[13px] font-mono leading-tight p-2">
            <style type="text/css" media="print" dangerouslySetInnerHTML={{ __html: `
                @page { 
                    size: 80mm; 
                    margin: 0mm !important; 
                }
                @media print {
                    *, *:before, *:after {
                        box-sizing: border-box !important;
                    }
                    html, body { 
                        width: 80mm !important; 
                        max-width: 80mm !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: #fff !important;
                        color: #000 !important;
                        overflow: visible !important;
                    }
                    #app {
                        display: none !important;
                    }
                    #thermal-print-root {
                        display: block !important;
                        position: relative !important;
                        float: none !important;
                        width: 80mm !important;
                        max-width: 80mm !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 2mm !important;
                        box-sizing: border-box !important;
                        background: #fff !important;
                        color: #000 !important;
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                }
            ` }} />

            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-black border-dashed">
                <h1 className="font-bold text-lg uppercase leading-tight">{organization?.name || 'CUE EATS'}</h1>
                <h2 className="font-black text-xl uppercase mt-0.5 tracking-wider">KITCHEN ORDER</h2>
            </div>

            {/* Order Details */}
            <div className="py-2 border-b-2 border-black border-dashed text-xs space-y-1 font-bold">
                <div className="flex justify-between">
                    <span>ORDER: {kot.order_number}</span>
                    <span>TABLE: {kot.table_name || 'Counter'}</span>
                </div>
                <div className="flex justify-between">
                    <span>ROUND: {kot.round_number}</span>
                    <span>TIME: {formattedTime}</span>
                </div>
                <div>KOT: {kot.kot_number}</div>
                {kot.waiter_name && <div>WAITER: {kot.waiter_name}</div>}
            </div>

            {/* Items List */}
            <div className="py-2 border-b-2 border-black border-dashed">
                {kot.items?.map((item: any, idx: number) => (
                    <div key={idx} className="mb-2 last:mb-0">
                        <div className="flex items-start text-sm font-black">
                            <span className="w-6 shrink-0">{item.quantity} ×</span>
                            <span className="flex-1">{item.menu_item_name || item.menu_item?.name}</span>
                        </div>
                        {item.modifiers?.map((mod: any, mIdx: number) => (
                            <div key={mIdx} className="text-xs pl-6 font-semibold italic text-slate-800">
                                - {mod.modifier_name || mod.modifier?.name}
                            </div>
                        ))}
                        {item.notes && (
                            <div className="text-xs pl-6 mt-0.5 font-bold">
                                * Note: {item.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center pt-2 text-[10px] font-bold uppercase tracking-wider">
                *** OPERATIONAL KOT — NOT A BILL ***
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
