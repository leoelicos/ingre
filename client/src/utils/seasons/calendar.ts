import seasonData from '../../data/seasons.json'
import { parseSeasons } from './seasons'

/** The bundled Sydney calendar (data/seasons.json), checked when the app loads. */
export const SEASONS = parseSeasons(seasonData)
