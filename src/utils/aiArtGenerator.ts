// Generates cute children's party illustration art for WhatsApp stickers

export interface ArtGenerationParams {
  prompt: string;
  themeColor?: string;
}

export function generateInfantArt(params: ArtGenerationParams): string {
  const { prompt } = params;
  const p = prompt.toLowerCase();

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = 150;
  const cy = 150;

  // Background circle with delicate soft pastel gradient
  let bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 140);
  if (p.includes('safari') || p.includes('safári') || p.includes('leão')) {
    bgGrad.addColorStop(0, '#FFFBEB');
    bgGrad.addColorStop(1, '#FEF3C7');
  } else if (p.includes('jardim') || p.includes('borboleta') || p.includes('flor')) {
    bgGrad.addColorStop(0, '#FFF5F8');
    bgGrad.addColorStop(1, '#FCE7F3');
  } else if (p.includes('mar') || p.includes('sereia') || p.includes('baleia') || p.includes('azul')) {
    bgGrad.addColorStop(0, '#F0FDFA');
    bgGrad.addColorStop(1, '#CCFBF1');
  } else if (p.includes('dino') || p.includes('dinossauro')) {
    bgGrad.addColorStop(0, '#F0FDF4');
    bgGrad.addColorStop(1, '#DCFCE7');
  } else {
    bgGrad.addColorStop(0, '#FFFDF0');
    bgGrad.addColorStop(1, '#FFE4EC');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Floating celebratory sparkles / stars in background
  const drawSparkle = (x: number, y: number, r: number, color = '#FDE047') => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawSparkle(50, 60, 4);
  drawSparkle(240, 70, 5);
  drawSparkle(230, 220, 3.5);
  drawSparkle(65, 230, 4);

  // Helper for festive party hat
  const drawPartyHat = (hx: number, hy: number, color1 = '#FF4B93', color2 = '#FDE047') => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(hx, hy - 40);
    ctx.lineTo(hx - 20, hy);
    ctx.lineTo(hx + 20, hy);
    ctx.closePath();
    ctx.fillStyle = color1;
    ctx.fill();

    // Stripes
    ctx.strokeStyle = color2;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy - 14);
    ctx.lineTo(hx + 12, hy - 14);
    ctx.moveTo(hx - 6, hy - 26);
    ctx.lineTo(hx + 6, hy - 26);
    ctx.stroke();

    // Pom pom on top
    ctx.beginPath();
    ctx.arc(hx, hy - 42, 6, 0, Math.PI * 2);
    ctx.fillStyle = color2;
    ctx.fill();
    ctx.restore();
  };

  // Helper for celebratory balloons
  const drawBalloons = (bx: number, by: number) => {
    ctx.save();
    // Balloon strings
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 30, by - 30);
    ctx.quadraticCurveTo(bx - 15, by + 20, bx, by + 40);
    ctx.moveTo(bx + 20, by - 35);
    ctx.quadraticCurveTo(bx + 10, by + 15, bx, by + 40);
    ctx.stroke();

    // Pink Balloon
    ctx.beginPath();
    ctx.ellipse(bx - 30, by - 40, 22, 28, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B8B';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.ellipse(bx - 36, by - 48, 6, 10, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    // Yellow/Cyan Balloon
    ctx.beginPath();
    ctx.ellipse(bx + 22, by - 45, 20, 26, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.ellipse(bx + 16, by - 52, 5, 9, 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    ctx.restore();
  };

  // Determine character style based on prompt
  if (p.includes('safari') || p.includes('safári') || p.includes('leão') || p.includes('girafa')) {
    // Cute Baby Lion
    // Mane
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE68A';
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.arc(cx - 40, cy - 35, 16, 0, Math.PI * 2);
    ctx.arc(cx + 40, cy - 35, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.arc(cx - 26, cy + 12, 10, 0, Math.PI * 2);
    ctx.arc(cx + 26, cy + 12, 10, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx - 18, cy - 4, 6, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 20, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose & Mouth
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 15, 8, 0.1, Math.PI - 0.1);
    ctx.stroke();

    drawPartyHat(cx, cy - 45, '#10B981', '#F59E0B');
    drawBalloons(cx + 60, cy - 20);
  } else if (p.includes('jardim') || p.includes('borboleta') || p.includes('fada')) {
    // Enchanted Butterfly / Fairy
    // Wings
    ctx.save();
    const wingGrad = ctx.createLinearGradient(cx - 80, cy - 60, cx + 80, cy + 60);
    wingGrad.addColorStop(0, '#F472B6');
    wingGrad.addColorStop(0.5, '#C084FC');
    wingGrad.addColorStop(1, '#38BDF8');

    // Upper wings
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.ellipse(cx - 45, cy - 25, 42, 35, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 45, cy - 25, 42, 35, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Lower wings
    ctx.beginPath();
    ctx.ellipse(cx - 35, cy + 30, 30, 24, 0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 35, cy + 30, 30, 24, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wing details / dots
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 45, cy - 25, 8, 0, Math.PI * 2);
    ctx.arc(cx + 45, cy - 25, 8, 0, Math.PI * 2);
    ctx.fill();

    // Butterfly body & cute face
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5, 12, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Face
    ctx.fillStyle = '#FCE7F3';
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 22, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 12, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy - 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 4, 4, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Antennae with golden hearts
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 30);
    ctx.quadraticCurveTo(cx - 18, cy - 48, cx - 22, cy - 50);
    ctx.moveTo(cx + 5, cy - 30);
    ctx.quadraticCurveTo(cx + 18, cy - 48, cx + 22, cy - 50);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(cx - 22, cy - 50, 5, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy - 50, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawBalloons(cx + 55, cy - 10);
  } else if (p.includes('princesa') || p.includes('castelo') || p.includes('coroa')) {
    // Little Cute Princess
    // Hair
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 48, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#FFE4E6';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 40, 0, Math.PI * 2);
    ctx.fill();

    // Bangs
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(cx, cy - 15, 38, Math.PI * 0.1, Math.PI * 0.9);
    ctx.fill();

    // Golden Crown
    ctx.save();
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy - 32);
    ctx.lineTo(cx - 24, cy - 56);
    ctx.lineTo(cx - 10, cy - 42);
    ctx.lineTo(cx, cy - 60);
    ctx.lineTo(cx + 10, cy - 42);
    ctx.lineTo(cx + 24, cy - 56);
    ctx.lineTo(cx + 26, cy - 32);
    ctx.closePath();
    ctx.fill();
    // Jewels
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(cx, cy - 44, 4, 0, Math.PI * 2);
    ctx.arc(cx - 18, cy - 42, 3, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 42, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Big Anime Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx - 15, cy + 5, 6, 0, Math.PI * 2);
    ctx.arc(cx + 15, cy + 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 17, cy + 3, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks & Smile
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.arc(cx - 22, cy + 16, 7, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy + 16, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 6, 0.1, Math.PI - 0.1);
    ctx.stroke();

    drawBalloons(cx + 55, cy - 15);
  } else if (p.includes('dino') || p.includes('dinossauro')) {
    // Cute Baby Dino
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 52, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    ctx.fillStyle = '#F59E0B';
    [-30, 0, 30].forEach((ox) => {
      ctx.beginPath();
      ctx.moveTo(cx + ox - 8, cy - 30);
      ctx.lineTo(cx + ox, cy - 48);
      ctx.lineTo(cx + ox + 8, cy - 30);
      ctx.fill();
    });

    // Face
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx - 18, cy + 4, 6, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 20, cy + 2, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(cx - 25, cy + 18, 8, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy + 18, 8, 0, Math.PI * 2);
    ctx.fill();

    drawPartyHat(cx - 10, cy - 35, '#FF4B93', '#FDE047');
    drawBalloons(cx + 55, cy - 20);
  } else {
    // Default: Adorable Teddy Bear with Party Balloons (O Ursinho Fofo do Ateliê)
    // Ears
    ctx.beginPath();
    ctx.arc(cx - 44, cy - 42, 22, 0, Math.PI * 2);
    ctx.arc(cx + 44, cy - 42, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#C28854';
    ctx.fill();

    // Inner Ears
    ctx.beginPath();
    ctx.arc(cx - 44, cy - 42, 12, 0, Math.PI * 2);
    ctx.arc(cx + 44, cy - 42, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#FCE7F3';
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.fillStyle = '#D99B66';
    ctx.fill();

    // Snout / Muzzle
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15, 26, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF7ED';
    ctx.fill();

    // Dark Little Nose
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 9, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#451A03';
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 15);
    ctx.lineTo(cx, cy + 22);
    ctx.arc(cx - 8, cy + 22, 8, 0, Math.PI * 0.7);
    ctx.moveTo(cx, cy + 22);
    ctx.arc(cx + 8, cy + 22, 8, Math.PI * 0.3, Math.PI);
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = '#FDA4AF';
    ctx.beginPath();
    ctx.arc(cx - 30, cy + 14, 11, 0, Math.PI * 2);
    ctx.arc(cx + 30, cy + 14, 11, 0, Math.PI * 2);
    ctx.fill();

    // Eyes with spark
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx - 20, cy - 4, 6.5, 0, Math.PI * 2);
    ctx.arc(cx + 20, cy - 4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 22, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Party Hat on Bear
    drawPartyHat(cx, cy - 50, '#FF4B93', '#FDE047');

    // Metallic Balloons floating beside bear
    drawBalloons(cx + 56, cy - 25);
  }

  return canvas.toDataURL('image/png');
}
