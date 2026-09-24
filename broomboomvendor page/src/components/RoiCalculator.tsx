"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Sparkles, TrendingUp, DollarSign, Car, Fuel, ShieldCheck } from "lucide-react";

interface RoiCalculatorProps {
  onApplyWithEstimate?: (cabs: number, tier: string) => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onApplyWithEstimate }) => {
  const [cabsCount, setCabsCount] = useState<number>(4);
  const [tripsPerDay, setTripsPerDay] = useState<number>(3);
  const [vehicleCategory, setVehicleCategory] = useState<"sedan" | "suv" | "hatchback" | "tempo">("suv");
  const [isIntroPromo, setIsIntroPromo] = useState<boolean>(true); // 0% commission toggle

  const vehicleRates = {
    hatchback: { name: "Hatchback (WagonR, Tiago)", avgFare: 550, fuelRatio: 0.38 },
    sedan: { name: "Prime Sedan (Dzire, Etios)", avgFare: 900, fuelRatio: 0.40 },
    suv: { name: "Prime SUV (Ertiga, Innova)", avgFare: 1550, fuelRatio: 0.44 },
    tempo: { name: "Tempo Traveller (12-17 Seat)", avgFare: 3400, fuelRatio: 0.46 },
  };

  const currentRate = vehicleRates[vehicleCategory];

  const calculations = useMemo(() => {
    const workingDaysPerMonth = 26;
    const dailyGrossPerCab = tripsPerDay * currentRate.avgFare;
    const monthlyGrossFleet = cabsCount * dailyGrossPerCab * workingDaysPerMonth;

    // Commission: 0% if promo active, else 7% on average
    const commissionRate = isIntroPromo ? 0 : 0.07;
    const broomboomCommission = monthlyGrossFleet * commissionRate;

    // Fuel & toll estimated cost
    const fuelAndTollCost = monthlyGrossFleet * currentRate.fuelRatio;

    // Driver salary / allowances allowance (approx 22% of revenue)
    const driverWages = monthlyGrossFleet * 0.22;

    // Net Monthly Profit to Vendor / Owner
    const netMonthlyProfit = monthlyGrossFleet - broomboomCommission - fuelAndTollCost - driverWages;
    const netAnnualProfit = netMonthlyProfit * 12;
    const monthlyPerCab = cabsCount > 0 ? Math.round(netMonthlyProfit / cabsCount) : 0;

    const suggestedTier = cabsCount <= 3 ? "individual" : cabsCount <= 15 ? "fleet" : "enterprise";

    return {
      monthlyGrossFleet: Math.round(monthlyGrossFleet),
      broomboomCommission: Math.round(broomboomCommission),
      fuelAndTollCost: Math.round(fuelAndTollCost),
      netMonthlyProfit: Math.round(netMonthlyProfit),
      netAnnualProfit: Math.round(netAnnualProfit),
      monthlyPerCab,
      suggestedTier,
    };
  }, [cabsCount, tripsPerDay, currentRate, isIntroPromo]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="calculator" className="py-7 sm:py-9 bg-puja-cream text-slate-900 border-t border-amber-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-900 font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 shadow-sm">
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            Transparent Earning Forecast
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Interactive <span className="text-yellow-gradient">Fleet Earning Calculator</span>
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            Calculate your estimated monthly and annual income based on your vehicle models and fleet size.
          </p>
        </div>

        {/* Main Interactive Calculator Grid */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Controls Column (7 Cols) */}
          <div className="p-6 sm:p-8 lg:col-span-7 space-y-6">
            {/* Vehicle Category Selector */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">
                1. Select Primary Vehicle Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["hatchback", "sedan", "suv", "tempo"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setVehicleCategory(cat)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      vehicleCategory === cat
                        ? "bg-brand-yellow text-black border-amber-400 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    {cat === "hatchback" && "Hatchback"}
                    {cat === "sedan" && "Prime Sedan"}
                    {cat === "suv" && "Prime SUV"}
                    {cat === "tempo" && "Tempo / Bus"}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 1: Cabs Count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  2. Number of Cabs Attached:
                </span>
                <span className="text-base font-black text-amber-800 bg-amber-50 px-3 py-0.5 rounded-lg border border-amber-200">
                  {cabsCount} {cabsCount === 1 ? "Cab" : "Cabs"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={cabsCount}
                onChange={(e) => setCabsCount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>1 Cab (Solo)</span>
                <span>10 Cabs (Agency)</span>
                <span>20+ Cabs (Enterprise)</span>
              </div>
            </div>

            {/* Slider 2: Trips Per Day Per Cab */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  3. Average Trips / Day Per Cab:
                </span>
                <span className="text-base font-black text-amber-800 bg-amber-50 px-3 py-0.5 rounded-lg border border-amber-200">
                  {tripsPerDay} Trips / day
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={tripsPerDay}
                onChange={(e) => setTripsPerDay(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>1 Long Outstation Trip</span>
                <span>3 - 4 Airport/City Trips</span>
                <span>6+ Local Commute Trips</span>
              </div>
            </div>

            {/* 0% Commission Promo Toggle */}
            <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-xs font-black text-amber-950">
                    Apply 0% Commission Launch Offer
                  </div>
                  <div className="text-[11px] text-amber-800">
                    BroomBoom takes ₹0 platform commission for first 30 days
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isIntroPromo}
                onChange={(e) => setIsIntroPromo(e.target.checked)}
                className="w-5 h-5 accent-brand-yellow rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Column (5 Cols) */}
          <div className="bg-slate-950 text-white p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2.5 py-0.5 rounded-md inline-block mb-3">
                Estimated Net Earnings
              </span>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Monthly Net Profit (After Fuel & Wages):</span>
                  <div className="text-3xl sm:text-4xl font-black text-brand-yellow tracking-tight mt-0.5">
                    {formatCurrency(calculations.netMonthlyProfit)}
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">
                    ~ {formatCurrency(calculations.monthlyPerCab)} / cab / month
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Gross Fleet Monthly Turnover:</span>
                    <span className="font-bold text-white">{formatCurrency(calculations.monthlyGrossFleet)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Est. Fuel & Toll Expenses:</span>
                    <span className="font-semibold text-slate-400">- {formatCurrency(calculations.fuelAndTollCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>BroomBoom Platform Commission:</span>
                    <span className={`font-semibold ${isIntroPromo ? "text-emerald-400" : "text-slate-400"}`}>
                      {isIntroPromo ? "₹0 (0% Promo)" : `- ${formatCurrency(calculations.broomboomCommission)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-bold pt-1">
                    <span>Projected Annual Net Profit:</span>
                    <span className="text-sm font-black text-brand-yellow">{formatCurrency(calculations.netAnnualProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800">
              <Link
                href={`/apply?tier=${calculations.suggestedTier}&cabs=${cabsCount}`}
                className="w-full py-3 px-4 bg-brand-yellow hover:bg-brand-yellow-hover text-black font-black text-xs sm:text-sm rounded-xl shadow-yellow-glow flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>APPLY WITH THIS FLEET FORECAST</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                *Estimates based on average fares and typical vehicle utilization across 120+ Indian cities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

