"use client";

import { useState } from "react";
import {
    Mail,
    MessageSquare,
    Send,
    Calendar,
    Users,
    History,
    Search,
    Plus,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function MarketingDashboard() {
    const [emailTitle, setEmailTitle] = useState("");
    const [whatsappMessage, setWhatsappMessage] = useState("");

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-50 font-sans text-slate-900">
            <div>
                <h1 className="text-3xl font-bold text-brand-primary">Marketing Dashboard</h1>
                <p className="text-slate-500 text-sm">Engagement, campaigns, and customer outreach tools</p>
            </div>

            <Tabs defaultValue="email" className="space-y-6">
                <TabsList className="bg-white border border-slate-200 p-1">
                    <TabsTrigger value="email" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                        <Mail className="w-4 h-4 mr-2" /> Email Campaign
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="data-[state=active]:bg-[#25D366] data-[state=active]:text-white">
                        <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp Outreach
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="w-4 h-4 mr-2" /> Campaign History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 bg-white border-slate-200">
                            <CardHeader>
                                <CardTitle>Compose Email</CardTitle>
                                <CardDescription>Create a new mass email for your customers</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Subject Line</Label>
                                    <Input
                                        placeholder="e.g. 50% Off Your Next Rental!"
                                        value={emailTitle}
                                        onChange={(e) => setEmailTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Content (HTML Supported)</Label>
                                    <Textarea
                                        placeholder="Design your email here..."
                                        className="min-h-[300px]"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline">Save Draft</Button>
                                    <Button className="bg-brand-primary hover:opacity-90">
                                        <Send className="w-4 h-4 mr-2" /> Send to All Users
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">Targeting</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-slate-500">Audience Segment</Label>
                                        <select className="w-full p-2 border border-slate-200 rounded-md text-sm">
                                            <option>All Users (4,500)</option>
                                            <option>Active Renters (1,200)</option>
                                            <option>Sellers Only (450)</option>
                                            <option>New Users - Last 30 Days (320)</option>
                                        </select>
                                    </div>
                                    <Button variant="outline" className="w-full text-xs h-8">
                                        <Plus className="w-3 h-3 mr-1" /> Create New Segment
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Avg. Open Rate</span>
                                        <span className="font-bold text-green-600">24.5%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Avg. Click Rate</span>
                                        <span className="font-bold text-blue-600">3.2%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="whatsapp" className="space-y-6">
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#25D366]" />
                                WhatsApp Campaign Manager
                            </CardTitle>
                            <CardDescription>Send direct WhatsApp messages to your users</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Message Template</Label>
                                        <Textarea
                                            placeholder="Hello {{name}}, check out our new collection!"
                                            className="min-h-[150px]"
                                            value={whatsappMessage}
                                            onChange={(e) => setWhatsappMessage(e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-400 italic">Use {"{{name}}"}, {"{{discount}}"} for variables.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Schedule Sending</Label>
                                        <div className="flex gap-2">
                                            <Input type="datetime-local" className="flex-1" />
                                            <Button variant="outline"><Clock className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-12 bg-[#075E54] flex items-center px-4 gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-300" />
                                        <span className="text-sm font-bold">ShahidRa Rentals</span>
                                    </div>
                                    <div className="mt-14 space-y-4">
                                        <div className="bg-[#DCF8C6] text-slate-800 p-3 rounded-lg rounded-tl-none max-w-[80%] text-xs shadow-sm">
                                            {whatsappMessage || "Your message preview will appear here..."}
                                        </div>
                                    </div>
                                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Preview Mode</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline">Test Message</Button>
                                <Button className="bg-[#25D366] hover:opacity-90 text-white">
                                    <Send className="w-4 h-4 mr-2" /> Start WhatsApp Campaign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="bg-white border-slate-200 overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Campaign</th>
                                        <th className="px-6 py-3 text-left">Type</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                        <th className="px-6 py-3 text-left">Sent</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { name: "Summer Sale 2024", type: "Email", date: "2024-03-20", count: "4,200", status: "Completed" },
                                        { name: "Wedding Collection Alert", type: "WhatsApp", date: "2024-03-18", count: "1,200", status: "Completed" },
                                        { name: "Retention Campaign", type: "Email", date: "2024-03-15", count: "850", status: "Draft" },
                                    ].map((camp, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold">{camp.name}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={camp.type === 'Email' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}>
                                                    {camp.type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{camp.date}</td>
                                            <td className="px-6 py-4 font-medium">{camp.count}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={camp.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                                                    {camp.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm">View Report</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
