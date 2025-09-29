import React, { createContext, useContext, useState } from 'react';
import DamageClaims from '../DamageClaims/DamageClaims';

// Create a context to track pending damage claims
export const DamageClaimsContext = createContext({
  pendingClaimsCount: 0,
  setPendingClaimsCount: () => {}
});

// Custom hook to use the context
export const useDamageClaims = () => useContext(DamageClaimsContext);

function DamageReports() {
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  return (
    <DamageClaimsContext.Provider value={{ pendingClaimsCount, setPendingClaimsCount }}>
      <DamageClaims />
    </DamageClaimsContext.Provider>
  );
}

export default DamageReports; 