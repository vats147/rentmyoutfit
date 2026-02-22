"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Settings,
    Bell,
    Lock,
    RefreshCw,
    Percent,
    Wallet,
    MapPin,
    Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function AdminSecurityPage() {
    const [config, setConfig] = useState({
        platformFee: 5,
        minDeposit: 500,
        referralEnabled: true,
        referralDiscount: 10,
        referralCredit: 200,
        arTryOnEnabled: false,
        depositReleaseHours: 24,
        maxSearchRadius: 50,
    });

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-50 font-sans text-slate-900">
            <div>
                <h1 className="text-3xl font-bold text-brand-primary">Security & Settings</h1>
                <p className="text-slate-500 text-sm">Configure platform-wide parameters and security protocols</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Settings */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-brand-primary" />
                            Platform Configuration
                        </CardTitle>
                        <CardDescription>Core marketplace economics and logic</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                    <Percent className="w-3 h-3" /> Platform Fee (%)
                                </Label>
                                <Input
                                    type="number"
                                    value={config.platformFee}
                                    onChange={(e) => setConfig({ ...config, platformFee: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                    <Wallet className="w-3 h-3" /> Min Deposit (₹)
                                </Label>
                                <Input
                                    type="number"
                                    value={config.minDeposit}
                                    onChange={(e) => setConfig({ ...config, minDeposit: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Release (Hours)
                                </Label>
                                <Input
                                    type="number"
                                    value={config.depositReleaseHours}
                                    onChange={(e) => setConfig({ ...config, depositReleaseHours: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Search Radius (km)
                                </Label>
                                <Input
                                    type="number"
                                    value={config.maxSearchRadius}
                                    onChange={(e) => setConfig({ ...config, maxSearchRadius: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-brand-primary hover:opacity-90">Save Economic Config</Button>
                    </CardContent>
                </Card>

                {/* Referral Settings */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-brand-primary" />
                            Referral Program
                        </CardTitle>
                        <CardDescription>Viral growth and incentive settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="font-bold">Enable Referrals</Label>
                                <p className="text-xs text-slate-500">Allow users to earn rewards via invites</p>
                            </div>
                            <Switch
                                checked={config.referralEnabled}
                                onCheckedChange={(checked) => setConfig({ ...config, referralEnabled: checked })}
                            />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Discount (%)</Label>
                                <Input
                                    type="number"
                                    value={config.referralDiscount}
                                    onChange={(e) => setConfig({ ...config, referralDiscount: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Credit (₹)</Label>
                                <Input
                                    type="number"
                                    value={config.referralCredit}
                                    onChange={(e) => setConfig({ ...config, referralCredit: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <Button variant="outline" className="w-full">Update Incentives</Button>
                    </CardContent>
                </Card>

                {/* Feature Flags */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-brand-gold" />
                            Feature Flags
                        </CardTitle>
                        <CardDescription>Toggle platform capabilities instantly</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="font-bold">AR Try-On</Label>
                                <p className="text-xs text-slate-500">Enable virtual outfit try-on</p>
                            </div>
                            <Switch
                                checked={config.arTryOnEnabled}
                                onCheckedChange={(checked) => setConfig({ ...config, arTryOnEnabled: checked })}
                            />
                        </div>
                        {/* More flags can be added here */}
                        <Button className="w-full bg-slate-800 text-white hover:bg-slate-900">Apply Feature Changes</Button>
                    </CardContent>
                </Card>

                {/* Security Status */}
                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            System Security Status
                        </CardTitle>
                        <CardDescription>Live health & compliance overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500">SSL Certificate</span>
                                <Badge className="bg-green-100 text-green-700 border-green-200">Valid</Badge>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500">KYC Verification Engine</span>
                                <Badge className="bg-green-100 text-green-700 border-green-200">Operational</Badge>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-slate-500">Database Backup</span>
                                <span className="text-slate-700 font-medium">4 hours ago</span>
                            </div>
                        </div>
                        <Separator />
                        <Button variant="ghost" className="w-full text-brand-primary flex items-center gap-2 hover:bg-slate-50">
                            <Bell className="w-4 h-4" /> View Security Audit Logs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
