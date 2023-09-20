export type FfmpegLoglevel = 'info' | 'error'

export type FfmpegExecProgress = {
  speed: number
  frames: number
}

export type FfProbeData = {
  streams: FfProbeStream[]
  format: FfProbeFormat
}

export type FfProbeStream = {
  index: number // e.g. 0
  codec_name: string // e.g. 'vp9'
  codec_long_name: string // e.g. 'Google VP9'
  profile: string // e.g. 'Profile 0'
  codec_type: 'video' | 'audio'
  codec_tag_string: string // e.g. '[0][0][0][0]', 'avc1'
  codec_tag: string // e.g. '0x0000'
  width: number // e.g. 3840
  height: number // e.g. 1920
  coded_width: number // e.g. 3840
  coded_height: number // e.g. 1920
  closed_captions: number // e.g. 0
  film_grain: number // e.g. 0
  has_b_frames: number // e.g. 2
  sample_aspect_ratio: string // e.g. '1:1'
  display_aspect_ratio: string // e.g. '2:1'
  pix_fmt: string // e.g. 'yuv420p'
  level: string // e.g. '-99'
  color_range: string // e.g. 'tv'
  color_space: string // e.g. 'bt709'
  color_transfer: string // e.g. 'bt709'
  color_primaries: string // e.g. 'bt709'
  chroma_location: string // e.g. 'unspecified'
  field_order: string // e.g. 'unknown', 'progressive'
  refs: number // e.g. 1
  is_avc?: 'true' | 'false' // e.g. 'true'
  id: string // e.g. 'N/A', '0x1
  r_frame_rate: string // e.g. '60/1'
  avg_frame_rate: string // e.g. '60/1'
  time_base: string // e.g. '1/1000'
  start_pts: number // e.g. 0
  start_time: number // e.g. 0
  duration_ts: number | 'N/A' // e.g. 'N/A'
  duration: number | 'N/A' // e.g. 'N/A'
  bit_rate: number | 'N/A' // e.g. 'N/A'
  max_bit_rate: number | 'N/A' // e.g. 'N/A'
  bits_per_raw_sample: number | 'N/A' // e.g. 'N/A'
  nb_frames: number | 'N/A' // e.g. 'N/A'
  nb_read_frames: number | 'N/A' // e.g. 'N/A'
  nb_read_packets: number | 'N/A' // e.g. 'N/A'
  tags: Record<string, string>
  side_data_type: string // Display Matrix
  displaymatrix: string
  rotation: string // -90
  disposition?: {
    default?: number // e.g. 1
    dub?: number // e.g. 0
    original?: number // e.g. 0
    comment?: number // e.g. 0
    lyrics?: number // e.g. 0
    karaoke?: number // e.g. 0
    forced?: number // e.g. 0
    hearing_impaired?: number // e.g. 0
    visual_impaired?: number // e.g. 0
    clean_effects?: number // e.g. 0
    attached_pic?: number // e.g. 0
    timed_thumbnails?: number // e.g. 0
    captions?: number // e.g. 0
    descriptions?: number // e.g. 0
    metadata?: number // e.g. 0
    dependent?: number // e.g. 0
    still_image?: number // e.g. 0
  }
}

export type FfProbeFormat = {
  filename: string // e.g. "tmp/video-head.orig",
  nb_streams: number // e.g.  1
  nb_programs: number // e.g. 0
  format_name: string // e.g. "matroska,webm",
  format_long_name: string // e.g. "Matroska / WebM",
  start_time: number // e.g. 0
  duration: number // e.g. 529.467
  size: number // e.g. 4097
  bit_rate: number // e.g. 61
  probe_score: number // e.g. 100
  tags?: Record<string, string>
}
