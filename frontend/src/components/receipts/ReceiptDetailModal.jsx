import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Calendar, Edit3, Trash2 } from 'lucide-react';
import emergentAPI from '@/api/emergentClient';

export default function ReceiptDetailModal({ receipt, isOpen, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    if (!receipt) return null;

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this receipt?')) return;
        
        setLoading(true);
        try {
            await emergentAPI.Receipt.delete(receipt.id);
            onUpdate && onUpdate();
            onClose();
        } catch (error) {
            console.error('Error deleting receipt:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processing_background': return 'bg-yellow-100 text-yellow-800';
            case 'review_insights': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'error': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">Receipt Details</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(receipt.validation_status)}>
                                {receipt.validation_status?.replace('_', ' ')}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={handleEdit}>
                                <Edit3 className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-6">
                    {/* Receipt Info */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{receipt.supermarket}</h3>
                                    {receipt.store_location && (
                                        <p className="text-gray-600 mb-2">{receipt.store_location}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(receipt.purchase_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-600">
                                        {receipt.currency} {receipt.total_amount?.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {receipt.items?.length || 0} items
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    {receipt.items && receipt.items.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-4">Items ({receipt.items.length})</h4>
                                <div className="space-y-3">
                                    {receipt.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.canonical_name || item.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {item.category && (
                                                        <Badge variant="outline" className="mr-2">
                                                            {item.category}
                                                        </Badge>
                                                    )}
                                                    {item.pack_size && `${item.pack_size} • `}
                                                    {item.quantity && `Qty: ${item.quantity}`}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">
                                                    {receipt.currency} {item.total_price?.toFixed(2) || item.unit_price?.toFixed(2)}
                                                </div>
                                                {item.unit_price && item.total_price !== item.unit_price && (
                                                    <div className="text-sm text-gray-500">
                                                        {receipt.currency} {item.unit_price.toFixed(2)} each
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Receipt Insights */}
                    {receipt.receipt_insights && (
                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-4">AI Insights</h4>
                                {receipt.receipt_insights.summary && (
                                    <div className="mb-4">
                                        <p className="text-gray-700">{receipt.receipt_insights.summary}</p>
                                    </div>
                                )}
                                {receipt.receipt_insights.highlights && receipt.receipt_insights.highlights.length > 0 && (
                                    <div>
                                        <h5 className="font-medium mb-2">Highlights:</h5>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                            {receipt.receipt_insights.highlights.map((highlight, index) => (
                                                <li key={index}>{highlight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    {receipt.notes && (
                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2">Notes</h4>
                                <p className="text-gray-700">{receipt.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}