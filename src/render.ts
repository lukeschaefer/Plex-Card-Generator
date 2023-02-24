const fs = require('fs')
const { XMLParser } = require("fast-xml-parser");
import puppeteer from 'puppeteer';
import minimist from 'minimist';
const { getPaletteFromURL } = require('color-thief-node');

interface Movie {
  title: string,
  summary: string,
  duration: string,
  contentRating: string,
  year: string,
  posterUrl: string,
  metadata: string,
  themeColor?: string,
  textColor?: string,
}

// Super tiny utility for generating plex URLs:
class MiniPlexApi {
  private parser = new XMLParser({ignoreAttributes: false,});
  constructor(public domain :string, public port : number, public token: string) {}

  async getCollectionMetadata(collection: string, limit:number = 200) : Promise<Movie[]> {
    const url = `http://${this.domain}:${this.port}/library/collections/${collection}/children?excludeAllLeaves=1&X-Plex-Container-Start=0&X-Plex-Container-Size=${limit}&X-Plex-Token=${this.token}`
    
    const response = await fetch(url);
    const xml = await response.text();

    let jObj = this.parser.parse(xml);

    return jObj.MediaContainer.Video.map((video: { [x: string]: any; }) => {
      const rating = video["@_contentRating"];
      return {
          title: video["@_title"],
          summary: video["@_summary"],
          year: video["@_year"],
          duration: Math.round(Number(video["@_duration"])/(60 * 1000)) + " minutes",
          contentRating: rating ? `Rated ${video["@_contentRating"]}` : "Unrated",
          posterUrl: this.generateImageUrl(video["@_thumb"]),
          color: 'white'
      }
    });
  }

  generateImageUrl = (thumb: string) => {
    const image = thumb.replace("/", "%2F");

    return `http://${this.domain}:${this.port}/photo/:/transcode?width=1000&height=360&minSize=1&upscale=1&url=${image}%3FX-Plex-Token%3D${this.token}&X-Plex-Token=${this.token}`
  }
}


async function render() {
  const args = minimist(process.argv.slice(2));
  if(args._.length > 1) {
    console.log(`Invalid command - get rid of "${args._[1]}"`)
    return;
  }
  const outputDir = args._[0] || "images";

  const domain = args['domain'] || "127.0.0.1";
  const port = args['port'] || 32400;

  const collection = args["collection"] || "3701" || console.error("Specify a collection");
  const token = args["token"] || "X7X4HxSLkgQ9rds5Reit" || console.error("Need a Plex Web token");
  
  console.log("Connecting to plex...");

  const plex = new MiniPlexApi(domain, port, token);
  let movies : Movie[] = [];

  try {
    movies = await plex.getCollectionMetadata(collection);
  } catch (e) {
    console.error("Sorry, couldn't parse the response from plex. Maybe invalid token/collection?");
    return;
  }

  console.log("Success!")

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.setViewport({
    width: 1650,
    height: 1100,
  });

  const template = fs.readFileSync("template.html", {encoding: "utf-8"});

  const generateHtml = function(movie : Movie) {
    // Yeah, yeah, I know. There's a million templating languages out there or whatever.
    // this will do just fine.
    let templateCopy = template
      .replaceAll("{{title}}", movie.title)
      .replaceAll("{{posterUrl}}", movie.posterUrl)
      .replaceAll("{{summary}}", movie.summary)
      .replaceAll("{{year}}", movie.year)
      .replaceAll("{{contentRating}}", movie.contentRating)
      .replaceAll("{{themeColor}}", movie.themeColor)
      .replaceAll("{{textColor}}", movie.textColor)
      .replaceAll("{{duration}}", movie.duration);
    return templateCopy;
  }

  for(let movie of movies) {
    const i = movies.indexOf(movie);
    const logMovie = (msg: string) => console.log(`\t(${i}/${movies.length}) [${msg}]: ${movie.title}`);
    if(movie.summary.length > 395) {
      logMovie("TOO LONG")
    } else if(movie.summary.length < 132) {
      logMovie("TOO SHORT")
    }

    const colors : number[][] = (await getPaletteFromURL(movie.posterUrl, 6));
    const getBrightness = (a : number[]) => {
      return (a[0] + a[1] * 1.4 + a[2] * .6)/3
    }
    // Find the most saturated color for the border/background:
    let themeColor = colors.sort((a : number[],b : number[]) => {
      const aValue = Math.max(...a) * 2 - Math.min(...a) * 3;
      const bValue = Math.max(...b) * 2 - Math.min(...b) * 3;
      return bValue - aValue;
    })[0];
    while(getBrightness(themeColor) < 100) {
      themeColor = themeColor.map(a => Math.min(255, Math.max(a, (a * 1.2))));
    }
    movie.themeColor = `rgb(${themeColor[0]}, ${themeColor[1]},${themeColor[2]})`;


    // Find the brightest color for the text:
    let textColor = colors.sort((a : number[],b : number[]) => {
      return getBrightness(b) - getBrightness(a);
    })[0];

    while(getBrightness(textColor) < 200) {
      textColor = textColor.map(a => Math.min(255, Math.max(a, (a * 1.2))));
    }
    
    movie.textColor = `rgb(${textColor[0]}, ${textColor[1]},${textColor[2]})`;
        
    const pageContent = generateHtml(movie);
    fs.writeFileSync("output.html", pageContent);

    const fileName = movie.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await page.goto(`file:${__dirname}/../output.html`);
    await page.screenshot({
      path: `./images/${fileName}.png`,
      omitBackground: false,
    });
    logMovie("SUCCESS")    
  }

  await browser.close();

  console.log("Done!"); 
}

render();
