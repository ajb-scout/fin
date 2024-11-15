// src/hooks/useBsmModule.ts
import { useEffect, useState } from 'react';
declare global {
    interface Window {
        createBsmModule:any;
    }
}

const useBsmModule = () => {
    const [bsmWasm, setModule] = useState<any | null>(null);

    useEffect(() => {
        const initializeModule = async () => {
            if (window.createBsmModule) {
                try {
                    const instance = await window.createBsmModule();
                    setModule(instance);
                    console.log('Loaded module:', instance);
                } catch (error) {
                    console.error('Error loading BSM module:', error);
                }
            } else {
                console.error('createBsmModule is not defined');
            }
        };

        initializeModule();
    }, []);

    return bsmWasm;
};

export default useBsmModule;
