import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function PrintReceipt({ 
    order, 
    isBillOnly = false,
    onPrinted 
}: { 
    order: any, 
    isBillOnly?: boolean,
    onPrinted?: () => void 
}) {
    const { organization } = usePage().props as any;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (order && mounted) {
            const timer = setTimeout(() => {
                window.print();
                if (onPrinted) onPrinted();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [order, mounted]);

    if (!order || !mounted) return null;

    const location = order.location || {};
    const date = new Date(order.created_at || Date.now()).toLocaleString();
    
    // Check if we should render KOT section on regular non-dining checkout
    const isDineIn = order.order_type === 'Dine-in';
    const showKOT = !isBillOnly && !isDineIn;

    const content = (
        <div id="thermal-print-root" className="text-black bg-white w-full max-w-[80mm] text-[12px] font-mono leading-tight p-2">
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

            {/* --- CUSTOMER RECEIPT / BILL --- */}
            <div className="text-center mb-3">
                <h1 className="font-bold text-lg uppercase leading-tight">{organization?.name || 'Restaurant'}</h1>
                {location.address && <p className="text-[11px]">{location.address}</p>}
                {location.phone && <p className="text-[11px]">Tel: {location.phone}</p>}
                {location.receipt_header && <p className="mt-1 text-[10px] whitespace-pre-wrap">{location.receipt_header}</p>}
            </div>

            <div className="mb-3 border-y border-black border-dashed py-1.5 text-xs">
                <div className="flex justify-between">
                    <span>Order: <strong>{order.order_number}</strong></span>
                    <span>{order.order_type}</span>
                </div>
                <div className="flex justify-between mt-0.5">
                    <span>{date}</span>
                    <span>Cashier: {order.cashier?.name || 'Admin'}</span>
                </div>
                {order.customer_name && (
                    <div className="mt-0.5">Customer: {order.customer_name}</div>
                )}
            </div>

            {(() => {
                // Consolidate identical items across rounds for clean customer receipt
                const consolidated: Record<string, any> = {};
                (order.items || []).forEach((item: any) => {
                    const modIds = (item.modifiers || []).map((m: any) => m.modifier_id || m.modifier?.id).sort().join(',');
                    const key = `${item.menu_item_id || item.menu_item?.id}_${item.notes || ''}_${modIds}`;
                    
                    const unitPrice = Number(item.unit_price || item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const lineSubtotal = (unitPrice > 0) ? (unitPrice * qty) : Number(item.subtotal || 0);

                    if (!consolidated[key]) {
                        consolidated[key] = {
                            ...item,
                            quantity: qty,
                            subtotal: lineSubtotal,
                        };
                    } else {
                        consolidated[key].quantity += qty;
                        consolidated[key].subtotal += lineSubtotal;
                    }
                });
                const itemList = Object.values(consolidated);

                return (
                    <table className="w-full mb-3 text-xs">
                        <thead>
                            <tr className="border-b border-black text-left">
                                <th className="w-8 pb-1">Qty</th>
                                <th className="pb-1">Item</th>
                                <th className="text-right pb-1">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemList.map((item: any, idx: number) => (
                                <tr key={idx} className="align-top">
                                    <td className="pt-1.5 font-bold">{item.quantity}</td>
                                    <td className="pt-1.5">
                                        <div className="font-bold">{item.menu_item?.name || 'Item'}</div>
                                        {item.modifiers?.map((mod: any, mIdx: number) => (
                                            <div key={mIdx} className="text-[10px] pl-2">+ {mod.modifier?.name}</div>
                                        ))}
                                        {item.notes && (
                                            <div className="text-[10px] italic">Note: {item.notes}</div>
                                        )}
                                    </td>
                                    <td className="text-right pt-1.5 font-bold">${Number(item.subtotal).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            })()}

            <div className="border-t border-black pt-1.5 mb-3 space-y-1 text-xs">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax / GST</span>
                    <span>${parseFloat(order.tax_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1.5 pt-1.5 border-t border-black">
                    <span>TOTAL</span>
                    <span>${parseFloat(order.grand_total || 0).toFixed(2)}</span>
                </div>
                {order.payment_method && (
                    <div className="flex justify-between text-[10px] mt-0.5">
                        <span>Paid via {order.payment_method}</span>
                    </div>
                )}
            </div>

            <div className="text-center mt-2 mb-2">
                {location.receipt_footer && <p className="mb-1 whitespace-pre-wrap">{location.receipt_footer}</p>}
                <p className="font-bold">Thank you for your visit!</p>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
