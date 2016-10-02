// function

function colorNormalize(data) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    // let a = data[i+3];

    let colorSum = r + g + b;
    let rNormalized = r / colorSum;
    let gNormalized = g / colorSum;
    let bNormalized = b / colorSum;

    data[i] = rNormalized * 255;
    data[i+1] = gNormalized * 255;
    data[i+2] = bNormalized * 255;
    data[i+3] = 255;
  }
}

// https://en.wikipedia.org/wiki/Color_normalization
// grey world algorithm

function greyWorldNormalize(data) {
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    // let a = data[i+3];

    rSum += r;
    gSum += g;
    bSum += b;
  }
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    // let a = data[i+3];

    data[i] = (r * n / rSum) * 255;
    data[i+1] = (g * n / gSum) * 255;
    data[i+2] = (b * n / bSum) * 255;
    data[i+3] = 255;
  }
}

function hsvNormalize(data) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    // let a = data[i+3];

    let hsv = RGBtoHSV(r, g, b);
    hsv.v = 0.8;
    let rgb = HSVtoRGB(hsv);

    data[i] = rgb.r;
    data[i+1] = rgb.g;
    data[i+2] = rgb.b;
    data[i+3] = 255;
  }
}

// hsv functions from
// http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}
