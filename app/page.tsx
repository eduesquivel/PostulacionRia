"use client";

import { useState, useEffect } from "react";

// --- TIPOS ---
type Rates = Record<string, number>;


import Spinner from "./components/spinner";
import Card from "./components/card";
import CurrencyConverter from "./components/currencyConverter";
import LiveRates from "./components/liveRates";


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
            <CurrencyConverter
              amount={amount}
              setAmount={setAmount}
              fromCurrency={fromCurrency}
              setFromCurrency={setFromCurrency}
              toCurrency={toCurrency}
              setToCurrency={setToCurrency}
              currencies={currencies}
              converting={converting}
              convertedResult={convertedResult}
              exchangeRate={exchangeRate}
              trend={trend}
            />
          </div>
        </Card>

        {/* SECCIÓN 2: LIVE RATES (Sin cambios mayores) */}
        <Card>
          <LiveRates
            baseCurrency={baseCurrency}
            setBaseCurrency={setBaseCurrency}
            ratesLoading={ratesLoading}
            currencies={currencies}
            rates={rates}
          />
        </Card>
      </div>
    </main>
  );
}
