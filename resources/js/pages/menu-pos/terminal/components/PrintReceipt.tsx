import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export function PrintReceipt({ order, onPrinted }: { order: any, onPrinted?: () => void }) {
    const { organization } = usePage().props as any;
    
    useEffect(() => {
        if (order) {
            // Small delay to ensure render is complete
            const timer = setTimeout(() => {
                window.print();
                if (onPrinted) onPrinted();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (!order) return null;

    const location = order.location || {};
    const date = new Date(order.created_at).toLocaleString();
    
    // Determine if we should print KOT, Receipt, or both based on location settings
    const workflow = location.kitchen_workflow || 'print_only';
    const showKOT = workflow === 'print_only' || workflow === 'both';
    
    return (
        <>
            <style type="text/css" media="print" dangerouslySetInnerHTML={{ __html: `
                @page { 
                    size: 80mm 297mm; 
                    margin: 0; 
                }
                html, body { 
                    width: 80mm !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                }
            ` }} />
            <div className="hidden print:block text-black bg-white w-full max-w-[80mm] mx-auto text-[12px] font-mono leading-tight p-2">
                {/* --- CUSTOMER RECEIPT --- */}
            <div className="text-center mb-4">
                <h1 className="font-bold text-xl mb-1 uppercase">{organization?.name || 'Restaurant'}</h1>
                {location.address && <p>{location.address}</p>}
                {location.phone && <p>Tel: {location.phone}</p>}
                {location.receipt_header && <p className="mt-2 text-[10px] whitespace-pre-wrap">{location.receipt_header}</p>}
            </div>

            <div className="mb-4 border-y border-black border-dashed py-2">
                <div className="flex justify-between">
                    <span>Order: <strong>{order.order_number}</strong></span>
                    <span>{order.order_type}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>{date}</span>
                    <span>Cashier: {order.cashier?.name || 'Admin'}</span>
                </div>
                {order.customer_name && (
                    <div className="mt-1">Customer: {order.customer_name}</div>
                )}
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-black text-left">
                        <th className="w-10 pb-1">Qty</th>
                        <th className="pb-1">Item</th>
                        <th className="text-right pb-1">Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item: any) => (
                        <tr key={item.id} className="align-top">
                            <td className="pt-2">{item.quantity}</td>
                            <td className="pt-2">
                                <div className="font-bold">{item.menu_item?.name}</div>
                                {item.modifiers?.map((mod: any, idx: number) => (
                                    <div key={idx} className="text-[10px] pl-2">+ {mod.modifier?.name}</div>
                                ))}
                            </td>
                            <td className="text-right pt-2">${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 mb-4 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${parseFloat(order.tax_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black">
                    <span>TOTAL</span>
                    <span>${parseFloat(order.grand_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                    <span>Paid via {order.payment_method}</span>
                </div>
            </div>

            <div className="text-center mt-4 mb-4">
                {location.receipt_footer && <p className="mb-2 whitespace-pre-wrap">{location.receipt_footer}</p>}
                <p className="font-bold">Thank you for your visit!</p>
            </div>

            {/* --- KOT SECTION (If applicable) --- */}
            {showKOT && (
                <>
                    {/* Tear/Cut Line */}
                    <div className="border-t-2 border-black border-dashed my-8 text-center text-xs">
                        <span className="bg-white px-2">✂ CUT HERE ✂</span>
                    </div>

                    <div className="text-center mb-4">
                        <h2 className="font-black text-2xl uppercase mb-1">KOT</h2>
                        <h3 className="font-bold text-xl">{order.order_type}</h3>
                    </div>

                    <div className="mb-4 border-y border-black border-dashed py-2 font-bold text-sm">
                        <div className="flex justify-between">
                            <span className="text-xl">#{order.order_number}</span>
                        </div>
                        <div className="mt-1 font-normal text-xs">{date}</div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-black text-left">
                                <th className="w-12 pb-1 text-lg">Qty</th>
                                <th className="pb-1 text-lg">Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item: any) => (
                                <tr key={item.id} className="align-top border-b border-gray-300">
                                    <td className="pt-3 pb-3 font-black text-xl">{item.quantity}</td>
                                    <td className="pt-3 pb-3">
                                        <div className="font-bold text-base">{item.menu_item?.name}</div>
                                        {item.modifiers?.map((mod: any, idx: number) => (
                                            <div key={idx} className="text-sm font-semibold italic pl-2">+ {mod.modifier?.name}</div>
                                        ))}
                                        {item.notes && (
                                            <div className="text-sm border border-black p-1 mt-1 font-semibold">Note: {item.notes}</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
        </>
    );
}
