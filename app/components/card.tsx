import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border border-slate-100 ${className}`}>
        {children}
    </div>
);

export default Card;
