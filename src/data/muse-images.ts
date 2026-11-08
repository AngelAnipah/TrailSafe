type MuseTrailImage = {
  src: string;
  alt: string;
  sourceUrl: string;
  photographer: string;
  license: string;
  licenseUrl: string;
};

// Verified trail-specific Wikimedia Commons image records. The local assets
// were downloaded from the linked Commons source pages and keep their credit.
export const museTrailImages: Record<string, MuseTrailImage> = {
  "donut-falls": {
    src: "/trails/donut-falls.jpg",
    alt: "Hike to Donut Falls in Big Cottonwood Canyon, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:20170116-FS-UWC_NF-NL-Hike_to_donut_falls_(23807302398).jpg",
    photographer: "Nate Lowe / U.S. Forest Service",
    license: "Public domain (U.S. federal government work)",
    licenseUrl: "https://www.usa.gov/government-copyright",
  },
  "lake-blanche": {
    src: "/trails/lake-blanche.jpg",
    alt: "Sundial Peak and snowy ridges above Lake Blanche, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sundial_Peak_and_snowy_ridges_above_Lake_Blanche,_Twin_Peaks_Wilderness,_Utah.jpg",
    photographer: "Z3lvs",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  "mount-timpanogos": {
    src: "/trails/mount-timpanogos.jpg",
    alt: "Mount Timpanogos from the trail approaching the saddle",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mount_Timpanogos_from_Mount_Timpanogos_Trail_approaching_the_saddle.jpg",
    photographer: "Brian Smith",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  "angels-landing": {
    src: "/trails/angels-landing.jpg",
    alt: "Angels Landing in Zion National Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Angels_Landing.jpg",
    photographer: "Tobias Alt",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "the-narrows": {
    src: "/trails/the-narrows.jpg",
    alt: "The Narrows canyon in Zion National Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Zion_Narrows.jpg",
    photographer: "Jon Sullivan",
    license: "Public domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
  },
  "frary-peak": {
    src: "/trails/frary-peak.jpg",
    alt: "Frary Peak ridge on Antelope Island State Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Antelope_Island_State_Park_-_Frary_Peak_ridge_01.jpg",
    photographer: "Z3lvs",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  "delicate-arch": {
    src: "/trails/delicate-arch.jpg",
    alt: "Delicate Arch in Arches National Park, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Delicate_Arch_in_Arches_National_Park_3.jpg",
    photographer: "Jonathan Zander (Digon3)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  "cecret-lake": {
    src: "/trails/cecret-lake.jpg",
    alt: "Cecret Lake panorama in Albion Basin, Alta, Utah",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cecret_Lake_Panorama_Albion_Basin_Alta_Utah_July_2009.jpg",
    photographer: "Jeffrey McGrath",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
};
