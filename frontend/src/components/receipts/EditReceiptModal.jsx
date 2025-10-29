
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X, Loader2, ChevronDown, ChevronUp, CheckCircle, Edit, Clock, AlertTriangle, FileText, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from '@/components/utils/currency';
import FailureFeedbackModal from "../scan/FailureFeedbackModal";

const CATEGORIES = [
    { value: "meat_fish", label: "Meat & Fish", color: "bg-red-100 text-red-800" },
    { value: "vegetables_fruits", label: "Vegetables & Fruits", color: "bg-green-100 text-green-800" },
    { value: "dairy_eggs", label: "Dairy & Eggs", color: "bg-blue-100 text-blue-800" },
    { value: "bakery", label: "Bakery", color: "bg-yellow-100 text-yellow-800" },
    { value: "snacks_sweets", label: "Snacks & Sweets", color: "bg-pink-100 text-pink-800" },
    { value: "beverages", label: "Beverages", color: "bg-purple-100 text-purple-800" },
    { value: "household_cleaning", label: "Household & Cleaning", color: "bg-gray-100 text-gray-800" },
    { value: "personal_care", label: "Personal Care", color: "bg-indigo-100 text-indigo-800" },
    { value: "frozen_foods", label: "Frozen Foods", color: "bg-cyan-100 text-cyan-800" },
    { value: "pantry_staples", label: "Pantry Staples", color: "bg-orange-100 text-orange-800" },
    { value: "other", label: "Other", color: "bg-slate-100 text-slate-800" }
];

const getApprovalIcon = (state) => {
    switch (state) {
        case 'approved':
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'corrected':
            return <Edit className="w-4 h-4 text-orange-600" />;
        case 'manual_add':
            return <Plus className="w-4 h-4 text-blue-600" />;
        default: // pending
            return <Clock className="w-4 h-4 text-slate-400" />;
    }
};

export default function EditReceiptModal({ receipt, onSave, onClose }) {
    const [receiptData, setReceiptData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    // Define calculateTotal BEFORE useEffect that uses it
    const calculateTotal = (items) => {
        return (items || []).reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
    };

    useEffect(() => {
        if (receipt) {
            // Process items to ensure approval_state and discount fields exist
            const processedReceipt = {
                ...receipt,
                items: (receipt.items || []).map(item => ({
                    ...item,
                    approval_state: item.approval_state || 'pending',
                    discount_applied: item.discount_applied || 0,
                    offer_description: item.offer_description || ''
                }))
            };
            setReceiptData(JSON.parse(JSON.stringify(processedReceipt)));
            const isMobile = window.innerWidth < 768;
            setIsDetailsOpen(!isMobile);
            
            // Calculate initial total
            const total = calculateTotal(processedReceipt.items);
            setCalculatedTotal(total);
        } else {
            setReceiptData(null);
            setCalculatedTotal(0);
        }
    }, [receipt]);
    
    if (!receiptData) {
        return null;
    }
    
    const currency = receiptData.currency || 'GBP';
    const validationStatus = receiptData.validation_status || 'pending'; // Ensure validationStatus is defined

    const updateReceiptField = (field, value) => {
        setReceiptData(prev => ({ ...prev, [field]: value }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...receiptData.items];
        const oldValue = newItems[index][field];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Mark as corrected if value changed (unless manually added)
        if (oldValue !== value && newItems[index].approval_state !== 'manual_add') {
            newItems[index].approval_state = 'corrected';
        }
        
        if (['quantity', 'unit_price', 'discount_applied'].includes(field)) {
            const qty = parseFloat(newItems[index].quantity) || 1;
            const unitPrice = parseFloat(newItems[index].unit_price) || 0;
            const discount = parseFloat(newItems[index].discount_applied) || 0;
            // FIXED: Correct discount calculation to avoid floating point issues
            newItems[index].total_price = Math.round(((qty * unitPrice) - discount) * 100) / 100;
        }
        
        const newTotal = calculateTotal(newItems);
        setCalculatedTotal(newTotal);
        setReceiptData(prev => ({ ...prev, items: newItems, total_amount: newTotal }));
    };

    const setItemApprovalState = (index, state) => {
        const newItems = [...receiptData.items];
        newItems[index] = {
            ...newItems[index],
            approval_state: state,
            approved_at: new Date().toISOString()
        };
        setReceiptData(prev => ({ ...prev, items: newItems }));
    };

    const approveAllItems = () => {
        const newItems = receiptData.items.map(item => ({
            ...item,
            approval_state: 'approved',
            approved_at: new Date().toISOString()
        }));
        setReceiptData(prev => ({ ...prev, items: newItems }));
    };

    const approveRemainingItems = () => {
        const newItems = receiptData.items.map(item => {
            if (item.approval_state === 'pending') {
                return {
                    ...item,
                    approval_state: 'approved',
                    approved_at: new Date().toISOString()
                };
            }
            return item;
        });
        setReceiptData(prev => ({ ...prev, items: newItems }));
    };

    const addNewItem = () => {
        setReceiptData(prev => ({
            ...prev,
            items: [...(prev.items || []), { 
                name: '', 
                category: 'other', 
                quantity: 1, 
                unit_price: 0, 
                total_price: 0,
                discount_applied: 0,
                offer_description: '',
                approval_state: 'manual_add'
            }]
        }));
    };

    const removeItem = (index) => {
        const newItems = receiptData.items.filter((_, i) => i !== index);
        const newTotal = calculateTotal(newItems);
        setCalculatedTotal(newTotal);
        setReceiptData(prev => ({ ...prev, items: newItems, total_amount: newTotal }));
    };

    const handleSave = async () => {
        setSaving(true);
        const finalData = { 
            ...receiptData, 
            total_amount: calculatedTotal,
            validation_status: 'validated'
        };
        if (onSave) {
            await onSave(receipt.id, finalData);
        }
        setSaving(false);
    };

    const handleSubmitDiscardFeedback = async ({ issues, comment }) => {
        try {
            if (receipt) {
                const { FailedScanLog } = await import("@/api/entities");
                const { User } = await import("@/api/entities");
                
                try {
                    const user = await User.me();
                    
                    if (user && user.household_id && user.email) {
                        await FailedScanLog.create({
                            receipt_image_urls: receipt.receipt_image_urls || [],
                            extracted_data: receipt,
                            reported_issues: issues,
                            user_comment: comment,
                            household_id: user.household_id,
                            user_email: user.email
                        });
                        console.log("Feedback logged successfully");
                    }
                } catch (logError) {
                    console.error("Failed to log feedback (non-critical):", logError);
                }
            }

            try {
                const { Receipt } = await import("@/api/entities");
                await Receipt.delete(receipt.id);
                console.log("Receipt deleted successfully");
            } catch (deleteError) {
                console.warn("Receipt might already be deleted:", deleteError);
            }

            setShowDiscardModal(false);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error("Error during discard process:", error);
            setShowDiscardModal(false);
            onClose();
            window.location.reload();
        }
    };

    const handleSimplyDiscard = async () => {
        try {
            const { Receipt } = await import("@/api/entities");
            await Receipt.delete(receipt.id);
            console.log("Receipt deleted successfully");
        } catch (deleteError) {
            console.warn("Receipt might already be deleted:", deleteError);
        }
        
        setShowDiscardModal(false);
        onClose();
        window.location.reload();
    };

    const getCategoryColor = (categoryValue) => {
        const category = CATEGORIES.find(cat => cat.value === categoryValue);
        return category ? category.color : "bg-slate-100 text-slate-800";
    };
    
    const items = receiptData.items || [];

    // Calculate approval stats
    const approvalStats = {
        total: items.length,
        approved: items.filter(i => i.approval_state === 'approved').length,
        corrected: items.filter(i => i.approval_state === 'corrected').length,
        manual_add: items.filter(i => i.approval_state === 'manual_add').length,
        pending: items.filter(i => i.approval_state === 'pending').length
    };

    return (
        <>
            <Dialog open={!!receipt && !showDiscardModal} onOpenChange={(isOpen) => !isOpen && onClose()}>
                <DialogContent className="w-full h-full md:w-[95vw] md:max-w-5xl md:h-[95vh] max-w-none rounded-none md:rounded-lg flex flex-col p-0 overflow-hidden">
                    {/* Header - Reduced padding */}
                    <DialogHeader className="flex-shrink-0 p-3 md:p-4 border-b bg-white">
                        <div className="flex items-center justify-between mb-1">
                            <DialogTitle className="text-lg md:text-xl font-bold text-slate-900">
                                Validate Receipt
                            </DialogTitle>
                            {validationStatus === 'validated' && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1 border-green-200 text-xs py-0.5 px-2 font-medium">
                                    <CheckCircle className="w-3 h-3" />
                                    Validated
                                </Badge>
                            )}
                        </div>
                        <DialogDescription className="text-xs md:text-sm">
                            Review and approve items • {approvalStats.pending} pending
                        </DialogDescription>
                        
                        {/* Approval Stats Bar */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {approvalStats.approved} Approved
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                <Edit className="w-3 h-3 mr-1" />
                                {approvalStats.corrected} Corrected
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Plus className="w-3 h-3 mr-1" />
                                {approvalStats.manual_add} Added
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                <Clock className="w-3 h-3 mr-1" />
                                {approvalStats.pending} Pending
                            </Badge>
                            {approvalStats.pending > 0 && (
                                <>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-6 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        onClick={approveAllItems}
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Approve All
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-6 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        onClick={approveRemainingItems}
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Approve Remaining
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogHeader>
                    
                    {/* Sticky Total Bar - ENHANCED and visible on ALL screen sizes */}
                    <div className="flex-shrink-0 bg-emerald-50 border-b border-emerald-200 px-3 py-2.5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">Receipt Total:</span>
                            <span className="text-xl md:text-2xl font-bold text-emerald-600">
                                {formatCurrency(calculatedTotal, currency)}
                            </span>
                        </div>
                        <div className="text-xs text-slate-600 text-right mt-0.5">
                            {items.length} item{items.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Content Area - FIXED: proper height calculation and overflow */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto p-3 md:p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                
                                {/* Items Section - FIXED: removed nested scroll areas */}
                                <div className="md:col-span-2 flex flex-col">
                                    <div className="flex justify-between items-center mb-3 flex-shrink-0">
                                        <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                                            Items ({items.length})
                                        </h3>
                                        <Button onClick={addNewItem} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                    
                                    {/* Items list - no ScrollArea, uses parent's scroll */}
                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <ItemEditor 
                                                key={index} 
                                                item={item} 
                                                index={index} 
                                                onUpdate={updateItem} 
                                                onRemove={removeItem}
                                                onApprove={setItemApprovalState}
                                                currency={currency} 
                                                getCategoryColor={getCategoryColor}
                                            />
                                        ))}
                                        {items.length === 0 && (
                                            <div className="text-center py-8 text-slate-500">
                                                <p className="text-sm">No items in this receipt</p>
                                                <Button onClick={addNewItem} variant="outline" size="sm" className="mt-2">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add First Item
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Receipt Details Sidebar */}
                                <div className="md:col-span-1 flex-shrink-0">
                                    {/* Mobile: Collapsible */}
                                    <div className="md:hidden mb-4">
                                        <Button 
                                            variant="outline" 
                                            className="w-full justify-between mb-3 h-9"
                                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                        >
                                            <span className="font-semibold text-sm">Receipt Details</span>
                                            {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                        {isDetailsOpen && (
                                            <ReceiptDetailsForm 
                                                receiptData={receiptData}
                                                updateReceiptField={updateReceiptField}
                                                currency={currency}
                                            />
                                        )}
                                    </div>

                                    {/* Desktop: Always visible */}
                                    <div className="hidden md:block">
                                        <h3 className="font-semibold text-slate-800 mb-3 text-sm">Receipt Info</h3>
                                        <ReceiptDetailsForm 
                                            receiptData={receiptData}
                                            updateReceiptField={updateReceiptField}
                                            currency={currency}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Fixed at bottom with better mobile layout */}
                    <DialogFooter className="flex-shrink-0 border-t p-3 md:p-4 bg-white">
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 w-full">
                            {validationStatus !== 'validated' && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowDiscardModal(true)} 
                                    disabled={saving}
                                    className="text-xs sm:text-sm text-red-600 border-red-200 hover:bg-red-50 order-3 sm:order-1"
                                >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Discard
                                </Button>
                            )}
                            <div className={`flex gap-2 ${validationStatus !== 'validated' ? 'order-1 sm:order-2' : 'w-full justify-end'}`}>
                                <Button 
                                    variant="outline" 
                                    onClick={onClose} 
                                    disabled={saving} 
                                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                                >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSave} 
                                    disabled={saving} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm flex-1 sm:flex-none"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            Save & Validate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <FailureFeedbackModal
                isOpen={showDiscardModal}
                onClose={() => setShowDiscardModal(false)}
                onSubmit={handleSubmitDiscardFeedback}
                onDiscard={handleSimplyDiscard}
            />
        </>
    );
}

// Receipt details form component (simplified - removed total display as it's now in header)
function ReceiptDetailsForm({ receiptData, updateReceiptField, currency }) {
    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="supermarket" className="text-xs md:text-sm">Supermarket</Label>
                <Input 
                    id="supermarket" 
                    value={receiptData.supermarket || ''} 
                    onChange={(e) => updateReceiptField('supermarket', e.target.value)} 
                    className="mt-1 text-sm"
                />
            </div>
            <div>
                <Label htmlFor="store_location" className="text-xs md:text-sm">Store Location</Label>
                <Input 
                    id="store_location" 
                    value={receiptData.store_location || ''} 
                    onChange={(e) => updateReceiptField('store_location', e.target.value)} 
                    placeholder="e.g. Manchester City Centre"
                    className="mt-1 text-sm"
                />
            </div>
            <div>
                <Label htmlFor="purchase_date" className="text-xs md:text-sm">Purchase Date</Label>
                <Input 
                    id="purchase_date" 
                    type="date" 
                    value={formatDate(receiptData.purchase_date)} 
                    onChange={(e) => updateReceiptField('purchase_date', e.target.value)} 
                    className="mt-1 text-sm"
                />
            </div>
            <div>
                <Label htmlFor="notes" className="text-xs md:text-sm">Notes</Label>
                <Input 
                    id="notes" 
                    value={receiptData.notes || ''} 
                    onChange={(e) => updateReceiptField('notes', e.target.value)} 
                    placeholder="Optional notes..."
                    className="mt-1 text-sm"
                />
            </div>
            
            {/* Receipt images */}
            {(receiptData.receipt_image_urls && receiptData.receipt_image_urls.length > 0) && (
                <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" /> Receipt Images
                    </h4>
                    <div className="space-y-2">
                        {receiptData.receipt_image_urls.map((url, index) => (
                            <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="w-full text-left justify-start">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Image {receiptData.receipt_image_urls.length > 1 ? ` ${index + 1}` : ''}
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Item editor component with FIXED category dropdown scroll
function ItemEditor({ item, index, onUpdate, onRemove, onApprove, currency, getCategoryColor }) {
    const approvalState = item.approval_state || 'pending';
    
    return (
        <div className={`p-3 border rounded-lg space-y-2 ${
            approvalState === 'approved' ? 'bg-green-50 border-green-200' :
            approvalState === 'corrected' ? 'bg-orange-50 border-orange-200' :
            approvalState === 'manual_add' ? 'bg-blue-50 border-blue-200' :
            'bg-slate-50 border-slate-200'
        }`}>
            {/* Approval Status Header */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    {getApprovalIcon(approvalState)}
                    <span className="text-xs font-medium text-slate-600">
                        {approvalState === 'approved' && 'Approved'}
                        {approvalState === 'corrected' && 'Corrected'}
                        {approvalState === 'manual_add' && 'Added'}
                        {approvalState === 'pending' && 'Needs Review'}
                    </span>
                </div>
                
                <div className="flex items-center gap-1">
                    {/* Quick Approval Button */}
                    {approvalState === 'pending' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onApprove(index, 'approved')}
                            className="text-green-600 hover:bg-green-100 h-7 px-2"
                            title="Approve as correct"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </Button>
                    )}
                    
                    {/* Delete Button */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemove(index)} 
                        className="text-red-500 hover:bg-red-100 hover:text-red-600 h-7 px-2"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Item Name */}
            <div>
                <Input 
                    placeholder="Item Name" 
                    value={item.name || ''} 
                    onChange={(e) => onUpdate(index, 'name', e.target.value)} 
                    className="text-sm font-medium"
                />
            </div>
            
            {/* Category with FIXED scrollable dropdown */}
            <div>
                <Label className="text-xs text-slate-600 mb-1 block">Category</Label>
                <Select value={item.category || 'other'} onValueChange={(val) => onUpdate(index, 'category', val)}>
                    <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                <Badge variant="outline" className={`${cat.color} text-xs`}>
                                    {cat.label}
                                </Badge>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Price Fields */}
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Qty</Label>
                    <Input 
                        type="number" 
                        inputMode="numeric"
                        min="1"
                        value={item.quantity || 1} 
                        onChange={(e) => onUpdate(index, 'quantity', parseFloat(e.target.value) || 1)} 
                        onFocus={(e) => e.target.select()}
                        className="h-8 text-xs"
                    />
                </div>
                <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Unit £</Label>
                    <Input 
                        type="number" 
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={item.unit_price || 0} 
                        onChange={(e) => onUpdate(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                        onFocus={(e) => e.target.select()}
                        className="h-8 text-xs"
                    />
                </div>
                <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Total</Label>
                    <div className="px-2 py-1.5 bg-white border rounded-md font-semibold text-center text-slate-900 text-xs h-8 flex items-center justify-center">
                        {formatCurrency(item.total_price || 0, currency)}
                    </div>
                </div>
            </div>

            {/* Discount Fields */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Discount £</Label>
                    <Input 
                        type="number" 
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={item.discount_applied || 0} 
                        onChange={(e) => onUpdate(index, 'discount_applied', parseFloat(e.target.value) || 0)} 
                        onFocus={(e) => e.target.select()}
                        className="h-8 text-xs"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Offer</Label>
                    <Input 
                        value={item.offer_description || ''} 
                        onChange={(e) => onUpdate(index, 'offer_description', e.target.value)} 
                        className="h-8 text-xs"
                        placeholder="e.g. 3 for 2"
                    />
                </div>
            </div>
        </div>
    );
}

// Helper to format date for input[type=date]
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
};
