"use client";

import { useState, useEffect } from "react";

// --- TIPOS ---
type Rates = Record<string, number>;


import Spinner from "./components/spinner";
import Card from "./components/card";
import Select from "./components/select";


// --- COMPONENTE PRINCIPAL ---
export default function CurrencyDashboard() {
  // Estados Globales
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del Convertidor
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  // NUEVO: Guardamos la tasa unitaria (1 FROM = X TO)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedResult, setConvertedResult] = useState<number | null>(null);

  const [converting, setConverting] = useState(false); // Spinner solo para cambio de moneda

  // Estados del Overview de Tasas
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [rates, setRates] = useState<Rates>({});
  const [ratesLoading, setRatesLoading] = useState(false);

  // Estado del Bonus (Tendencia)
  const [trend, setTrend] = useState<"up" | "down" | "neutral" | null>(null);

  // 1. Fetch inicial de monedas
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        if (!res.ok) throw new Error("Error fetching currencies");
        const data = await res.json();
        setCurrencies(Object.keys(data));
        setInitialLoading(false);
      } catch (err) {
        setError("Failed to load currency data.");
        setInitialLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  // 2. Efecto PRINCIPAL: Solo se dispara si cambian las MONEDAS (Fetch API)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      // Si son iguales, tasa es 1 y no llamamos API
      if (fromCurrency === toCurrency) {
        setExchangeRate(1);
        setTrend("neutral");
        return;
      }

      setConverting(true); // Activamos spinner
      setExchangeRate(null); // Limpiamos tasa anterior para evitar cálculos erróneos durante carga

      try {
        // Fetch de la tasa para 1 unidad
        const res = await fetch(
          `https://api.frankfurter.app/latest?amount=1&from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await res.json();
        const newRate = data.rates[toCurrency];

        // BONUS: Fetch histórico para tendencia (usamos amount=1 también)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 2);
        const dateStr = yesterday.toISOString().split('T')[0];

        const histRes = await fetch(
          `https://api.frankfurter.app/${dateStr}?amount=1&from=${fromCurrency}&to=${toCurrency}`
        );
        const histData = await histRes.json();
        const oldRate = histData.rates[toCurrency];

        // Guardamos la tasa unitaria
        setExchangeRate(newRate);

        // Calculamos tendencia
        if (newRate > oldRate) setTrend("up");
        else if (newRate < oldRate) setTrend("down");
        else setTrend("neutral");

      } catch (err) {
        console.error("Conversion error", err);
        setError("Error fetching rates");
      } finally {
        setConverting(false); // Apagamos spinner
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency]); // <--- Dependencias reducidas: Ya no incluye 'amount'

  // 3. Efecto SECUNDARIO: Calcula el total instantáneamente (Cliente)
  useEffect(() => {
    if (exchangeRate !== null && amount !== undefined) {
      setConvertedResult(amount * exchangeRate);
    }
  }, [amount, exchangeRate]); // <--- Se ejecuta rápido al escribir

  // 4. Efecto para Live Rates (Panel derecho)
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      try {
        const targets = "EUR,GBP,JPY,AUD,CAD,CHF,CNY,SEK,NZD,MXN";
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targets}`
        );
        const data = await res.json();
        const filteredRates = { ...data.rates };
        delete filteredRates[baseCurrency];
        setRates(filteredRates);
      } catch (err) {
        console.error("Rates fetch error", err);
      } finally {
        setRatesLoading(false);
      }
    };
    if (baseCurrency) fetchRates();
  }, [baseCurrency]);

  if (initialLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner className="text-orange-600 w-10 h-10" />
    </div>
  );

  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Exchange Dashboard</h1>
        <p className="text-slate-600">Real-time rates & smart conversion</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECCIÓN 1: CONVERTIDOR */}
        <Card>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            💱 Currency Converter
          </h2>

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
        </Card>

        {/* SECCIÓN 2: LIVE RATES (Sin cambios mayores) */}
        <Card>
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
        </Card>
      </div>
    </main>
  );
}
