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

    // console.log(r, g, b);
    // console.log(rNormalized, gNormalized, bNormalized);

    data[i] = rNormalized * 255;
    data[i+1] = gNormalized * 255;
    data[i+2] = bNormalized * 255;
    data[i+3] = 255;
  }
}
