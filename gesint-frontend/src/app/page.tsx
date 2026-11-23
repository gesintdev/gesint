"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";

/**
 * `/` vai para o painel. O redirect fica no efeito (e no next.config) porque
 * `redirect()` no render disparava performance.measure com tempo negativo em HomePage.
 */
export default function HomePage() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/dashboard");
    }, [router]);
    return null;
}
