"use client";

import { useState } from "react";
import {
    LifeBuoy,
    MessageCircle,
    RotateCcw,
    ShieldCheck,
    AlertCircle,
    User,
    Search,
    Filter,
    ArrowUpRight,
    CheckCircle,
    XCircle,
    MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function SupportDashboard() {
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

    const tickets = [
        { id: "TIC-4512", user: "Rahul Mehta", issue: "Booking cancellation", priority: "High", status: "Open", time: "25m ago" },
        { id: "TIC-4509", user: "Sanya Patel", issue: "Deposit not released", priority: "Medium", status: "In Progress", time: "1h ago" },
        { id: "TIC-4501", user: "Amit Shah", issue: "Item damaged reported", priority: "Critical", status: "Open", time: "2h ago" },
        { id: "TIC-4498", user: "Meera Gupta", issue: "Account access issue", priority: "Low", status: "Closed", time: "5h ago" },
    ];

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Customer Support</h1>
                    <p className="text-slate-500 text-sm">Tickets, refunds, and real-time customer assistance</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Support${i}`} alt="Agent" />
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">+2</div>
                    </div>
                    <p className="text-xs text-slate-500 flex flex-col justify-center">
                        <span className="font-bold text-slate-800">5 Agents Online</span>
                        <span>Avg response: 4m</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tickets Sidebar */}
                <Card className="lg:col-span-1 bg-white border-slate-200 overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base">Support Tickets</CardTitle>
                            <Badge variant="outline" className="bg-brand-gold/10 text-brand-primary border-brand-gold/20">24 Pending</Badge>
                        </div>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input placeholder="Search tickets..." className="pl-9 h-9 text-xs bg-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-auto">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className={cn(
                                        "p-4 cursor-pointer hover:bg-slate-50 transition-colors",
                                        selectedTicket?.id === ticket.id && "bg-brand-primary/5 border-l-4 border-brand-primary"
                                    )}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-400">{ticket.id}</span>
                                        <span className="text-[10px] text-slate-500">{ticket.time}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{ticket.issue}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                <User className="w-3 h-3" />
                                            </div>
                                            <span className="text-xs text-slate-600 truncate max-w-[80px]">{ticket.user}</span>
                                        </div>
                                        <Badge className={cn(
                                            "text-[9px] uppercase font-bold",
                                            ticket.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                                                ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-blue-100 text-blue-600'
                                        )}>
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main View */}
                <div className="lg:col-span-2 space-y-8">
                    {selectedTicket ? (
                        <Card className="bg-white border-slate-200">
                            <CardHeader className="border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{selectedTicket.id}</Badge>
                                            <Badge className="bg-green-100 text-green-700">{selectedTicket.status}</Badge>
                                        </div>
                                        <CardTitle>{selectedTicket.issue}</CardTitle>
                                        <CardDescription>Requested by {selectedTicket.user} • 15th March 2024</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Assign to Me</Button>
                                        <Button className="bg-brand-primary" size="sm">Resolve</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTicket.user}`} alt="User" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-800">{selectedTicket.user}</p>
                                        <p className="text-sm text-slate-600">
                                            Hi, I need to cancel my booking for the "Bridal Red Lehenga" (BK-8821).
                                            The event has been postponed and I'd like to request a full refund of my deposit.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <span className="text-[10px] text-slate-400 bg-white px-2 -mb-3 z-10 font-bold uppercase tracking-widest">Live Chat Placeholder</span>
                                </div>
                                <Separator />

                                <div className="space-y-4">
                                    <Label>Internal Response</Label>
                                    <Textarea placeholder="Type your response to the customer..." className="min-h-[100px]" />
                                    <div className="flex justify-between">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm"><MessageSquare className="w-3.5 h-3.5 mr-2" /> Quick Reply</Button>
                                            <Button variant="ghost" size="sm"><RotateCcw className="w-3.5 h-3.5 mr-2" /> Request More Info</Button>
                                        </div>
                                        <Button className="bg-slate-800 text-white">Send Message</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <LifeBuoy className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">Select a ticket to view conversation</p>
                        </div>
                    )}

                    {/* Quick Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5 text-orange-500" /> Early Refund Release
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Booking ID</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="e.g. BK-8821" className="bg-slate-50" />
                                        <Button variant="outline">Verify</Button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic">Caution: Early refund release bypasses the standard 24-hour verification window.</p>
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 shadow-lg shadow-orange-500/20">
                                    Confirm Early Refund
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-blue-500" /> Live Assistance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-bold text-blue-900">4 Unassigned Chats</span>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-7 text-[10px]">Open Queue</Button>
                                </div>
                                <p className="text-[10px] text-slate-500">Current average wait time is under 2 minutes. All agents are performing within SLIs.</p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-lg shadow-blue-600/20">
                                    Go to Live Chat Console
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Separator() {
    return <div className="h-[1px] bg-slate-100 w-full" />;
}
