type MuseTrailImage = {
  src: string;
  alt: string;
  sourceUrl: string;
};

// Original, trail-specific image references supplied with the Muse handoff.
// Each source link leads to the Wikimedia Commons file page, including author
// and current reuse terms. These stay separate from the canonical trail data.
export const museTrailImages: Record<string, MuseTrailImage> = {
  "donut-falls": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/20170116-FS-UWC_NF-NL-Hike_to_donut_falls_%2823807302398%29.jpg/1280px-20170116-FS-UWC_NF-NL-Hike_to_donut_falls_%2823807302398%29.jpg",
    alt: "Hike to Donut Falls in Big Cottonwood Canyon, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:20170116-FS-UWC_NF-NL-Hike_to_donut_falls_(23807302398).jpg",
  },
  "lake-blanche": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Sundial_Peak_and_snowy_ridges_above_Lake_Blanche%2C_Twin_Peaks_Wilderness%2C_Utah.jpg/1280px-Sundial_Peak_and_snowy_ridges_above_Lake_Blanche%2C_Twin_Peaks_Wilderness%2C_Utah.jpg",
    alt: "Sundial Peak and snowy ridges above Lake Blanche, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sundial_Peak_and_snowy_ridges_above_Lake_Blanche,_Twin_Peaks_Wilderness,_Utah.jpg",
  },
  "mount-timpanogos": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Mount_Timpanogos_from_Mount_Timpanogos_Trail_approaching_the_saddle.jpg/1280px-Mount_Timpanogos_from_Mount_Timpanogos_Trail_approaching_the_saddle.jpg",
    alt: "Mount Timpanogos from the trail approaching the saddle",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mount_Timpanogos_from_Mount_Timpanogos_Trail_approaching_the_saddle.jpg",
  },
  "angels-landing": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Angels_Landing.jpg/1280px-Angels_Landing.jpg",
    alt: "Angels Landing in Zion National Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Angels_Landing.jpg",
  },
  "the-narrows": {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Zion_Narrows.jpg",
    alt: "The Narrows canyon in Zion National Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Zion_Narrows.jpg",
  },
  "frary-peak": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Antelope_Island_State_Park_-_Frary_Peak_ridge_01.jpg/1280px-Antelope_Island_State_Park_-_Frary_Peak_ridge_01.jpg",
    alt: "Frary Peak ridge on Antelope Island State Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Antelope_Island_State_Park_-_Frary_Peak_ridge_01.jpg",
  },
  "delicate-arch": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Delicate_Arch_in_Arches_National_Park_3.jpg/1280px-Delicate_Arch_in_Arches_National_Park_3.jpg",
    alt: "Delicate Arch in Arches National Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Delicate_Arch_in_Arches_National_Park_3.jpg",
  },
  "cecret-lake": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Cecret_Lake_Panorama_Albion_Basin_Alta_Utah_July_2009.jpg/1280px-Cecret_Lake_Panorama_Albion_Basin_Alta_Utah_July_2009.jpg",
    alt: "Cecret Lake panorama in Albion Basin, Alta, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cecret_Lake_Panorama_Albion_Basin_Alta_Utah_July_2009.jpg",
  },
};
