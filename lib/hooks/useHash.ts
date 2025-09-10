'use client'; // This is a client component

import { useState, useEffect } from 'react';

export const useHash = () => {
    const [hash, setHash] = useState(() => window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return hash;
};