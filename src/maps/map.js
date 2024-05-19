import cdutcm_wj from './cdutcm/wj.js'
import cuit_hkg from './cuit/hkg.js'
import cuit_lqy from './cuit/lqy.js'

const mapData = {
    cdutcm_wj: cdutcm_wj.mapdata,
    cuit_hkg: cuit_hkg.mapdata,
    cuit_lqy: cuit_lqy.mapdata
};

export function getMapData(mapChoice) {
    return mapData[mapChoice] || [];
}
