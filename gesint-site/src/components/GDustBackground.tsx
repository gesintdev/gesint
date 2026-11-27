"use client";

import {useEffect, useRef} from "react";

import {DESKTOP_QUERY, useMediaQuery} from "@/lib/use-media-query";

/**
 * Marca d'água do site: o "G" metálico do login (`/brand/logo-metalic.avif`) desfeito em poeira.
 *
 * A transparência da imagem define o formato; o brilho do metal define a intensidade de cada ponto,
 * então o reflexo do G continua aparecendo. Cada partícula flutua devagar e tem uma profundidade,
 * usada no parallax de rolagem. Ao rolar, os pontos se espalham pela tela e voltam a formar o G
 * no topo. O cursor é uma nave cruzando a poeira: o G tem espessura e a nave passa só numa fatia
 * dela: os pontos atingidos são jogados para a frente, deslizam perdendo força devagar e voltam devagar ao G.
 * Só no layout de desktop: no mobile não há marca d'água nenhuma (o canvas nem é montado).
 * Com "reduzir movimento", fica parado (desenhado uma vez, sem loop).
 * Em máquina fraca, mede o tempo de quadro e se simplifica sozinho (veja `lowerQuality`).
 */

const SOURCE = "/brand/logo-metalic.avif";
/** Altura (px) em que a imagem é amostrada; define a densidade de pontos. */
const SAMPLE_HEIGHT = 340;
const MAX_PARTICLES = 12000;
/** Máquina com poucos núcleos (≤ 4): começa com menos pontos. */
const MAX_PARTICLES_LOW_END = 7000;

/** Quadro médio (ms) acima do qual o G perde qualidade: ~40 fps. */
const SLOW_FRAME_MS = 24;
/** Quadros medidos antes de decidir (evita reagir ao pico de carregamento da página). */
const QUALITY_WARMUP_FRAMES = 90;
/** Intervalo mínimo (ms) entre dois degraus de qualidade. */
const QUALITY_COOLDOWN_MS = 2000;
/** Quantos degraus no máximo: retina desligada + duas reduções de pontos (até ~44% deles). */
const MAX_QUALITY_STEPS = 3;
/** Fração extra de poeira solta ao redor do G. */
const STRAY_RATIO = 0.05;
/** Intensidade geral: é marca d'água, então bem fraca. */
const STRENGTH = 0.55;

/** Fração dos pontos do G que passeia um pouco fora do contorno. */
const WANDERER_RATIO = 0.1;
/** Quão longe (fração do G) o andarilho mais distante vai além do contorno. */
const WANDER_REACH = 0.22;

/** Cores pré-calculadas: TONES tons (cinza médio → cinza claro, levemente frio como o texto do site) × ALPHAS pesos de cor (do quase sumido ao marcado). */
const TONES = 6;
const ALPHAS = 6;
const BUCKET_STYLES = Array.from({length: TONES * ALPHAS}, (_, index) => {
    const tone = Math.floor(index / ALPHAS) / (TONES - 1);
    const alpha = (0.06 + ((index % ALPHAS) / (ALPHAS - 1)) * 0.44) * STRENGTH;
    const r = Math.round(128 + (192 - 128) * tone);
    const g = Math.round(134 + (198 - 134) * tone);
    const b = Math.round(140 + (203 - 140) * tone);
    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
});

type Particle = {
    /** Posição na arte, de 0 a 1. */
    u: number;
    v: number;
    size: number;
    /** Índice em BUCKET_STYLES (cor + intensidade). */
    bucket: number;
    depth: number;
    phase: number;
    speed: number;
    amp: number;
    /** Destino quando espalhado, em fração da tela (0 a 1). */
    sx: number;
    sy: number;
    /** Ritmo próprio de saída (1 = o mais lento, chega ao fim junto com a rolagem). */
    pace: number;
    /** Desvio (px) no meio do trajeto, que curva o caminho. */
    swirlX: number;
    swirlY: number;
    /** Deslocamento (px) causado pelo cursor. */
    ox: number;
    oy: number;
    /** Se o ponto está em movimento por causa do cursor. */
    moving: boolean;
    /** Início do movimento (ms) e deslocamento que ele já tinha nesse instante. */
    start: number;
    fromX: number;
    fromY: number;
    /** Direção de saída (unitária), distância máxima (px) e curva total (rad) do caminho. */
    dirX: number;
    dirY: number;
    reach: number;
    curl: number;
    /** Oscilação lateral do caminho: amplitude (px), frequência (Hz) e fase. */
    wobble: number;
    wobbleHz: number;
    wobblePhase: number;
    /** Profundidade dentro da espessura do G (0 a 1). */
    z: number;
};

/** Plano (na espessura 0 a 1) em que a nave passa. */
const SHIP_PLANE = 0.5;
/** Meia-espessura da fatia atingida: 0.15 → ~30% dos pontos podem entrar no rastro. */
const SHIP_BAND = 0.15;
/** Raio (px) da esteira em volta do cursor. */
const SHIP_RADIUS = 70;
/**
 * Movimento de cada ponto atingido pela nave, num só gesto contínuo (sem fases nem paradas):
 * distância(t) = (e^(−BACK·t) − e^(−OUT·t)). A parte rápida (OUT) faz o ponto sair e perder força,
 * ele contorna o ponto mais distante sem parar, e a parte lenta (BACK) o traz de volta devagar,
 * chegando em casa sem passar do lugar. O caminho ondula para os lados na ida e na volta.
 */
/** Taxa (1/s) da saída: mais alto = sai mais rápido e chega antes ao ponto mais distante. */
const OUT_RATE = 4;
/** Taxa (1/s) da volta: mais baixo = volta mais devagar. */
const BACK_RATE = 0.45;
/** Distância máxima (px) de um ponto atingido em cheio por um gesto rápido. */
const MAX_REACH = 120;
/** Velocidade do cursor (px por quadro) que já dá a distância máxima. */
const FULL_SPEED = 18;
/** Variação de distância entre pontos (0 = todos iguais, 0.5 = até metade). */
const REACH_VARIATION = 0.5;
/** Abertura (rad) do leque de saída para cada lado da direção do cursor: 0.9 ≈ 50°. */
const CHASE_SPREAD = 0.9;
/** Curva máxima (rad) que o caminho faz ao longo do movimento. */
const PATH_CURL = 0.7;
/** Oscilação lateral máxima (px) do caminho. */
const WOBBLE = 16;

/** Instante (s) do ponto mais distante e o valor da curva ali (para normalizar a distância). */
const PEAK_TIME = Math.log(OUT_RATE / BACK_RATE) / (OUT_RATE - BACK_RATE);
const PEAK_SHAPE = Math.exp(-BACK_RATE * PEAK_TIME) - Math.exp(-OUT_RATE * PEAK_TIME);
/** Variação de ritmo entre pontos: os mais rápidos (topo do G) se soltam um pouco antes. */
const SCATTER_PACE_VARIATION = 0.15;
/** Peso linear da curva de dispersão: começa já se mexendo e acelera até o máximo no fim da página. */
const SCATTER_LINEAR = 0.7;
/** Oscilação extra (px) de todo ponto quando totalmente espalhado. */
const SCATTER_FLOAT = 22;
/** Quanto a dispersão alcança a rolagem por quadro ao descer (acompanha a rolagem). */
const SCATTER_RATE = 0.07;
/** O mesmo ao subir: mais baixo = o G se remonta mais devagar que a rolagem. */
const REGROUP_RATE = 0.022;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Oscilação lenta e irregular, de −1 a 1: três ondas com ritmos fora de compasso,
 * então o movimento nunca se repete num padrão (ao contrário de um seno só, que vira um círculo).
 */
const drift = (time: number, speed: number, phase: number) =>
    0.6 * Math.sin(time * speed + phase) +
    0.3 * Math.sin(time * speed * 1.73 + phase * 2.1) +
    0.1 * Math.sin(time * speed * 3.11 + phase * 3.7);

export function GDustBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDesktop = useMediaQuery(DESKTOP_QUERY);

    useEffect(() => {
        // Só no desktop (no mobile o canvas nem existe); espera saber o layout antes de montar.
        if (!isDesktop) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Com "reduzir movimento", o G fica parado (desenhado uma vez, sem loop).
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let particles: Particle[] = [];
        // Qualidade adaptativa: limite de densidade de pixels e medição do tempo de quadro.
        let dprCap = 2;
        let lastTime = 0;
        let frameAvg = 1000 / 60;
        let measured = 0;
        let qualitySteps = 0;
        let lastStepAt = 0;
        let aspect = 848 / 1264;
        let frame = 0;
        let width = 0;
        let height = 0;
        const pointer = {x: 0, y: 0, px: 0, py: 0, active: false};
        let scatter = 0;
        // A imagem carrega de forma assíncrona: se o efeito for desfeito antes (remontagem do React em dev,
        // troca de página), ela não pode iniciar um loop órfão, que desenharia por cima sem receber o cursor.
        let disposed = false;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (still) draw(0);
        };

        /**
         * Máquina fraca: o G se simplifica em degraus em vez de travar a página.
         * 1º degrau: canvas na resolução lógica (sem retina). Depois: menos pontos a cada degrau.
         */
        const lowerQuality = () => {
            qualitySteps++;
            if (qualitySteps === 1 && (window.devicePixelRatio || 1) > 1) {
                dprCap = 1;
                resize();
            } else {
                // As partículas estão ordenadas por cor: tirar 1 a cada 3 mantém a proporção de tons.
                particles = particles.filter((_, index) => index % 3 !== 2);
            }
            if (process.env.NODE_ENV !== "production") {
                console.info(
                    `[GDust] quadro médio ${frameAvg.toFixed(1)}ms: qualidade reduzida (degrau ${qualitySteps}, ${particles.length} pontos, dpr ≤ ${dprCap})`,
                );
            }
        };

        const draw = (time: number) => {
            ctx.clearRect(0, 0, width, height);
            if (!particles.length) return;

            const isWide = width >= 1024;
            // No desktop o G fica no centro, entre o título e o card do hero (atrás do card ele sumiria).
            const artH = Math.min(height * (isWide ? 1.05 : 0.7), isWide ? 1100 : 620);
            const artW = artH * aspect;
            const cx = isWide ? width * 0.42 : width * 0.5;
            const cy = height * 0.55;
            const scroll = window.scrollY;
            const t = time / 1000;
            // Dispersão ao longo da página inteira: 0 no topo (G formado) → 1 no rodapé (tela toda).
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
            const progress = clamp(scroll / maxScroll);
            // Curva acelerada: sai logo no início e a expansão cresce até o máximo no fim da rolagem.
            const scatterTarget = still ? 0 : SCATTER_LINEAR * progress + (1 - SCATTER_LINEAR) * progress * progress;
            // Descendo, a poeira acompanha a rolagem; voltando, ela se junta mais devagar que a rolagem.
            const scatterRate = scatterTarget > scatter ? SCATTER_RATE : REGROUP_RATE;
            scatter += (scatterTarget - scatter) * scatterRate;
            if (Math.abs(scatterTarget - scatter) < 0.0005) scatter = scatterTarget;

            // Velocidade do cursor neste quadro (o rastro só acontece com o mouse em movimento).
            const pointerVX = pointer.active ? pointer.x - pointer.px : 0;
            const pointerVY = pointer.active ? pointer.y - pointer.py : 0;
            pointer.px = pointer.x;
            pointer.py = pointer.y;
            const pointerMoving = pointerVX * pointerVX + pointerVY * pointerVY > 0.25;

            // As partículas vêm ordenadas por cor: um único fill por grupo, não um por ponto.
            let bucket = -1;
            for (const p of particles) {
                if (p.bucket !== bucket) {
                    if (bucket !== -1) ctx.fill();
                    bucket = p.bucket;
                    ctx.fillStyle = BUCKET_STYLES[bucket];
                    ctx.beginPath();
                }
                // Cada ponto anda no seu ritmo, então o G se desfaz de forma orgânica.
                const k = clamp(scatter * p.pace);
                // A flutuação cresce junto com o espalhamento: quanto mais solto, mais longe cada ponto oscila.
                const amp = p.amp * (1 + k * 4) + k * SCATTER_FLOAT;
                // Passeio lento e irregular (várias ondas fora de compasso), não um círculo repetido.
                const floatX = still ? 0 : drift(t, p.speed, p.phase) * amp;
                const floatY = still ? 0 : drift(t, p.speed * 0.87, p.phase + 1.3) * amp;
                // Posição no G (com leve parallax na primeira tela de rolagem).
                const gx = cx + (p.u - 0.5) * artW;
                const gy = cy + (p.v - 0.5) * artH - Math.min(scroll, height) * 0.12 * p.depth;
                // Destino espalhado pela tela inteira.
                const sx = p.sx * width;
                const sy = p.sy * height;
                // Caminho em curva: desvio máximo no meio do trajeto.
                const arc = Math.sin(k * Math.PI);
                const baseX = gx + (sx - gx) * k + arc * p.swirlX + floatX;
                const baseY = gy + (sy - gy) * k + arc * p.swirlY + floatY;

                // Nave atravessando a poeira: o G tem espessura (p.z) e o cursor passa só numa fatia
                // dela. Os pontos dessa fatia, perto do caminho, saem atrás da nave.
                const shipHit = 1 - Math.abs(p.z - SHIP_PLANE) / SHIP_BAND;
                // Pode ser atingido de novo só depois de passar do ponto mais distante (já voltando).
                const elapsed = p.moving ? (time - p.start) / 1000 : Infinity;
                if (pointerMoving && shipHit > 0 && elapsed > PEAK_TIME) {
                    const dx = baseX + p.ox - pointer.x;
                    const dy = baseY + p.oy - pointer.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < SHIP_RADIUS * SHIP_RADIUS) {
                        const influence = (1 - Math.sqrt(distSq) / SHIP_RADIUS) * shipHit;
                        const cursorSpeed = Math.hypot(pointerVX, pointerVY);
                        // Distância: maior com gesto rápido e ponto perto do cursor; varia entre pontos.
                        const reach =
                            MAX_REACH *
                            Math.min(1, cursorSpeed / FULL_SPEED) *
                            (0.5 + 0.5 * influence) *
                            (1 - REACH_VARIATION * Math.random());
                        if (reach > 3) {
                            // Direção sorteada num leque em volta do movimento do cursor.
                            const angle = Math.atan2(pointerVY, pointerVX) + (Math.random() * 2 - 1) * CHASE_SPREAD;
                            p.moving = true;
                            p.start = time;
                            p.fromX = p.ox;
                            p.fromY = p.oy;
                            p.dirX = Math.cos(angle);
                            p.dirY = Math.sin(angle);
                            p.reach = reach;
                            p.curl = (Math.random() * 2 - 1) * PATH_CURL;
                            p.wobble = WOBBLE * (0.4 + 0.6 * Math.random()) * (Math.random() < 0.5 ? -1 : 1);
                            p.wobbleHz = 0.12 + Math.random() * 0.18;
                            p.wobblePhase = Math.random() * Math.PI * 2;
                        }
                    }
                }

                if (p.moving) {
                    const s = (time - p.start) / 1000;
                    const back = Math.exp(-BACK_RATE * s);
                    // Um só movimento: sai, contorna o ponto mais distante sem parar e volta devagar.
                    const shape = (back - Math.exp(-OUT_RATE * s)) / PEAK_SHAPE;
                    const along = p.reach * shape;
                    // Ondulação lateral, que nasce e some junto com o movimento.
                    const wave = 2 * Math.PI * p.wobbleHz;
                    const lateral = p.wobble * drift(s, wave, p.wobblePhase) * shape;
                    // Também oscila um pouco no sentido do caminho, para não parecer um trilho.
                    const surge = p.wobble * 0.5 * drift(s, wave * 0.7, p.wobblePhase + 2) * shape;
                    // A direção gira aos poucos: o caminho faz uma curva em vez de uma reta.
                    const turn = p.curl * (1 - Math.exp(-1.5 * s));
                    const cos = Math.cos(turn);
                    const sin = Math.sin(turn);
                    const dirX = p.dirX * cos - p.dirY * sin;
                    const dirY = p.dirX * sin + p.dirY * cos;
                    // O deslocamento que já existia ao ser atingido também volta devagar.
                    p.ox = p.fromX * back + dirX * (along + surge) - dirY * lateral;
                    p.oy = p.fromY * back + dirY * (along + surge) + dirX * lateral;
                    if (s > PEAK_TIME && Math.abs(p.ox) + Math.abs(p.oy) < 0.15) {
                        p.moving = false;
                        p.ox = p.oy = 0;
                    }
                }

                const x = baseX + p.ox;
                const y = baseY + p.oy;
                if (y < -10 || y > height + 10) continue;
                // Ponto menor que 1px: um quadrado é idêntico na tela e bem mais barato que um arco.
                if (p.size < 1) ctx.rect(x - p.size, y - p.size, p.size * 2, p.size * 2);
                else {
                    ctx.moveTo(x + p.size, y);
                    ctx.arc(x, y, p.size, 0, Math.PI * 2);
                }
            }
            if (bucket !== -1) ctx.fill();
        };

        const loop = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;
            // Saltos grandes (aba em segundo plano, aba voltando) não contam como lentidão.
            if (delta > 0 && delta < 250) {
                frameAvg += (delta - frameAvg) * 0.05;
                measured++;
            }
            if (
                qualitySteps < MAX_QUALITY_STEPS &&
                measured > QUALITY_WARMUP_FRAMES &&
                frameAvg > SLOW_FRAME_MS &&
                time - lastStepAt > QUALITY_COOLDOWN_MS
            ) {
                lowerQuality();
                lastStepAt = time;
                measured = 0;
                frameAvg = 1000 / 60;
            }
            draw(time);
            frame = requestAnimationFrame(loop);
        };

        const onMouse = (event: PointerEvent) => {
            if (!pointer.active) {
                // Primeiro movimento: sem "salto" de velocidade.
                pointer.px = event.clientX;
                pointer.py = event.clientY;
            }
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            pointer.active = true;
        };
        const onLeave = () => {
            pointer.active = false;
        };

        const image = new Image();
        image.decoding = "async";
        image.src = SOURCE;
        image
            .decode()
            .then(() => {
                if (disposed) return;
                aspect = image.naturalWidth / image.naturalHeight;
                // Poucos núcleos costuma indicar máquina modesta: já começa com menos pontos.
                const cores = navigator.hardwareConcurrency || 8;
                const max = cores <= 4 ? MAX_PARTICLES_LOW_END : MAX_PARTICLES;
                particles = sampleParticles(image, max);
                resize();
                if (!still) frame = requestAnimationFrame(loop);
            })
            .catch(() => {
                /* Sem a imagem, o site segue sem a marca d'água. */
            });

        window.addEventListener("resize", resize);
        if (!still) {
            window.addEventListener("pointermove", onMouse, {passive: true});
            document.documentElement.addEventListener("pointerleave", onLeave);
        }
        resize();

        return () => {
            disposed = true;
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMouse);
            document.documentElement.removeEventListener("pointerleave", onLeave);
        };
    }, [isDesktop]);

    if (!isDesktop) return null;
    return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full"/>;
}

function sampleParticles(image: HTMLImageElement, max: number): Particle[] {
    const h = SAMPLE_HEIGHT;
    const w = Math.round((image.naturalWidth / image.naturalHeight) * h);
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d", {willReadFrequently: true});
    if (!octx) return [];
    octx.drawImage(image, 0, 0, w, h);
    const {data} = octx.getImageData(0, 0, w, h);

    const candidates: {u: number; v: number; light: number}[] = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            if (data[i + 3] < 110) continue;
            const light = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
            candidates.push({u: (x + Math.random()) / w, v: (y + Math.random()) / h, light});
        }
    }

    // Embaralha e corta para não pesar.
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const shapeCount = Math.min(candidates.length, Math.round(max * (1 - STRAY_RATIO)));
    const particles: Particle[] = candidates.slice(0, shapeCount).map((c) => makeParticle(c.u, c.v, c.light));

    // Poeira solta: perto do G, espalhada por uma área maior.
    const strayCount = Math.round(max * STRAY_RATIO);
    for (let i = 0; i < strayCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.35 + Math.random() * 0.55;
        particles.push(makeParticle(0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius * 0.8, Math.random(), true));
    }
    return particles.sort((a, b) => a.bucket - b.bucket);
}

function makeParticle(u: number, v: number, light: number, stray = false): Particle {
    const tone = Math.min(1, light * 0.9 + Math.random() * 0.25);
    // Andarilhos: parte dos pontos do G fica fora do contorno, mais perto é mais comum que mais longe.
    const wanderer = !stray && Math.random() < WANDERER_RATIO;
    // Distância da órbita do G, de 0 (no contorno) a 1 (o mais longe). Ao quadrado: rareia com a distância.
    const distance = stray ? 1 : wanderer ? Math.random() ** 2 : 0;
    const angle = Math.random() * Math.PI * 2;
    // Pontos do G ganham só um leve desvio (borda não recortada); andarilhos se afastam pela distância.
    const offset = wanderer ? 0.02 + distance * WANDER_REACH : Math.random() * 0.007;
    // Peso de cor: parte vem do brilho do metal, parte do acaso; quanto mais longe, mais fraco.
    const alpha = stray ? 0 : clamp(light * 0.55 + Math.random() * 0.55) * (1 - 0.55 * distance);
    // Quanto mais longe da órbita, mais solto e desordenado: oscila mais amplo e mais devagar.
    const looseness = 0.7 + Math.random() * 0.6;
    return {
        u: u + Math.cos(angle) * offset,
        v: v + Math.sin(angle) * offset * 0.75,
        size: randomSize(),
        bucket: Math.round(tone * (TONES - 1)) * ALPHAS + Math.round(alpha * (ALPHAS - 1)),
        depth: 0.8 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        // Pontos do G: oscilação visível (2 a 6px), curta o bastante para o contorno ficar nítido.
        speed: wanderer || stray ? (0.17 - 0.09 * distance) * looseness : 0.3 + Math.random() * 0.45,
        amp: wanderer || stray ? (5 + 46 * distance) * looseness : 2 + Math.random() * 4,
        // Um pouco além das bordas, para a tela inteira ficar coberta mesmo com a flutuação.
        sx: -0.03 + Math.random() * 1.06,
        sy: -0.03 + Math.random() * 1.06,
        // Ritmo: 75% acaso, 25% altura no G (o topo se solta um pouco antes).
        pace: 1 + SCATTER_PACE_VARIATION * clamp(0.75 * Math.random() + 0.25 * (1 - clamp(v))),
        swirlX: (Math.random() - 0.5) * 380,
        swirlY: (Math.random() - 0.5) * 280,
        ox: 0,
        oy: 0,
        moving: false,
        start: 0,
        fromX: 0,
        fromY: 0,
        dirX: 0,
        dirY: 0,
        reach: 0,
        curl: 0,
        wobble: 0,
        wobbleHz: 0,
        wobblePhase: 0,
        z: Math.random(),
    };
}

/** Raio (px): maioria pequena, parte média e poucos maiores. */
function randomSize() {
    const roll = Math.random();
    if (roll < 0.08) return 2 + Math.random() * 1.2;
    if (roll < 0.35) return 1.3 + Math.random() * 0.7;
    return 0.5 + Math.random() * 0.8;
}
