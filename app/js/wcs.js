function checkHeader(header_json) {
    var req_keys = ['CRVAL1', 'CRVAL1', 'CRPIX1', 'CRPIX2', 'CD1_1', 'CD1_2', 'CD2_1', 'CD2_2'];
    var missing = [];
    for(rk of req_keys){
        if(!(rk in header_json)){
            missing.push(rk);
        }
    }
    if(!(missing.length==0)){
        console.log('Missing Keys: ',missing);
    }
    return (missing.length==0);
}

function pix2world(pix_pos, json_header){
    var dx = pix_pos.x - json_header.CRPIX1;
    var dy = pix_pos.y - json_header.CRPIX2;
    var tmp = dx * json_header.CD1_1 + dy * json_header.CD1_2;
    dy = dx * json_header.CD2_1 + dy * json_header.CD2_2;
    dx = tmp;
    var cond2r = Math.PI/180;
    var ra0 = json_header.CRVAL1 * cond2r;
    var dec0 = json_header.CRVAL2 * cond2r;
    var l = dx * cond2r;
    var m = dy * cond2r;
    var sins = l*l + m*m;
    var decout = 0.0;
    var raout = 0.0;
    var cos0 = Math.cos(dec0);
    var sin0 = Math.sin(dec0);
    var dect = cos0 - m * sin0;
    var rat = ra0 + Math.atan2(l, dect);
    dect = Math.atan(Math.cos(rat-ra0) * (m * cos0 + sin0) / dect);
    raout = rat;
    decout = dect;
    if (raout-ra0 > Math.pi) {
        raout = raout - 2*Math.PI;
    }
    if (raout-ra0 < -Math.PI) {
        raout = raout + 2*Math.PI;
    }
    if (raout < 0.0) {
        raout += 2*Math.PI;
    }
    var ra_d = raout / cond2r;
    var dec_d = decout / cond2r;

    return {'ra': ra_d, 'dec': dec_d};
}

