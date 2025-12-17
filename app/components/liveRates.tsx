
import React from 'react';
import Spinner from "./spinner";

interface LiveRatesProps {
    baseCurrency: string;
    setBaseCurrency: (currency: string) => void;
    ratesLoading: boolean;
    currencies: string[];
    rates: Record<string, number>;
}

export const LiveRates = ({
    baseCurrency,
    setBaseCurrency,
    ratesLoading,
    currencies,
    rates,
}: LiveRatesProps) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Live Rates</h2>
                <div className="flex flex-col">
                    <h1 className='pb-1 text-sm font-medium text-slate-500'>Base Rate</h1>
                    <div className="w-24">
                        <select
                            value={baseCurrency}
                            onChange={(e) => setBaseCurrency(e.target.value)}
                            disabled={ratesLoading}
                            className="w-full p-1 text-sm border border-slate-300 rounded bg-slate-50 disabled:opacity-50"
                        >
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 min-h-[300px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Currency</th>
                            <th className="px-4 py-3 text-right">Rate (1 {baseCurrency})</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 relative">
                        {ratesLoading ? (
                            <tr>
                                <td colSpan={2} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Spinner className="text-blue-500 w-8 h-8" />
                                        <span className="text-slate-400">Loading new rates...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            Object.entries(rates).map(([curr, rate]) => (
                                <tr key={curr} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{curr}</td>
                                    <td className="px-4 py-3 text-right font-mono">{rate.toFixed(4)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
                Rates updated daily by European Central Bank
            </p>
        </>
    );
};

export default LiveRates;
