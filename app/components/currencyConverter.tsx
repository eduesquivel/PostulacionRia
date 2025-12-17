
import React from 'react';
import Spinner from "./spinner";
import Select from "./select";

interface CurrencyConverterProps {
    amount: number;
    setAmount: (amount: number) => void;
    fromCurrency: string;
    setFromCurrency: (currency: string) => void;
    toCurrency: string;
    setToCurrency: (currency: string) => void;
    currencies: string[];
    converting: boolean;
    convertedResult: number | null;
    exchangeRate: number | null;
    trend: "up" | "down" | "neutral" | null;
}

export const CurrencyConverter = ({
    amount,
    setAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    currencies,
    converting,
    convertedResult,
    exchangeRate,
    trend,
}: CurrencyConverterProps) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-500">Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-lg font-mono"
                    min="0"
                    placeholder="0"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="From"
                    value={fromCurrency}
                    options={currencies}
                    onChange={(e) => setFromCurrency(e.target.value)}
                />
                <Select
                    label="To"
                    value={toCurrency}
                    options={currencies}
                    onChange={(e) => setToCurrency(e.target.value)}
                />
            </div>

            {/* CAJA DE RESULTADO */}
            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100 min-h-[120px] flex flex-col justify-center">
                <p className="text-sm text-orange-600 font-medium mb-1">Converted Amount</p>

                {converting ? (
                    // LOADING: Solo aparece si cambian las monedas
                    <div className="flex items-center gap-2 py-2">
                        <Spinner className="text-orange-600" />
                        <span className="text-slate-400 text-lg">Updating rates...</span>
                    </div>
                ) : (
                    // RESULTADO: Se actualiza instantáneamente al escribir
                    <>
                        <div className="text-3xl font-bold text-slate-900">
                            {convertedResult ? convertedResult.toFixed(2) : '0.00'}
                            <span className="text-lg text-slate-500 ml-2">{toCurrency}</span>
                        </div>

                        {fromCurrency !== toCurrency && exchangeRate && (
                            <div className="mt-2 flex items-center gap-2 text-sm animate-in fade-in duration-300">
                                {/* Mostrar Tasa de Cambio Unitaria */}
                                <span className="text-slate-500 text-xs mr-2">
                                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                                </span>

                                {trend === "up" && <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-xs font-medium">Trending Up ↗</span>}
                                {trend === "down" && <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded text-xs font-medium">Trending Down ↘</span>}
                                {trend === "neutral" && <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">Stable -</span>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CurrencyConverter;
