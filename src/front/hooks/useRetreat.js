import { useEffect, useState } from "react";

export const useRetreat = () => {
    const [retreat, setRetreat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRetreat = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/api/retreats/current`;

                console.log("Retreat API URL:", url);

                const response = await fetch(url);

                console.log("Retreat response:", response.status);

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();

                console.log("Retreat data:", data);

                setRetreat(data);

            } catch (err) {
                console.error("Retreat fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadRetreat();
    }, []);

    return { retreat, loading, error };
};