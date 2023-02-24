# Plex-to-image

Goes through your plex library, and creates images for each item, using the configured poster, description, and colors from the poster. Looks like this:

<table>
<tr>
<td>
<img src="https://user-images.githubusercontent.com/5386710/221229925-493d9feb-4094-4908-8e48-c6778a6c69f6.png" width="300">
</td>
<td>
<img src="https://user-images.githubusercontent.com/5386710/221230269-427aa3aa-8ef1-47b2-8917-fe3163b82221.png" width="300">
</td>
<td>
<img src="https://user-images.githubusercontent.com/5386710/221230724-dda57dfd-c3d8-4b5d-8619-d0300c4769bf.png" width="300">
</td>
</tr>
</table>


This is a small script you can use to turn a Plex collection into a series of images, 
which includes their poster and text description. I used this to make a deck of cards
out of my collection, so that picking a movie can be a more fun process of "pick a random card".

It's **really hacky** since I made it in a weekend. I probably won't be improving this script any
more, unless I make another deck of cards in the future - but I figured I'd put this up
in case anyone wanted to use it.


## How to use

Run `npm install`, and then `npm start`.

Before you run the command - you need to have a valid **plex token** and **category id**.
When I wrote this program - I got those from snooping around the Plex web pages in devtools,
but there's probably a better way. But this should work - go to the collection you want to export, open up DevTools,
and paste this into the console:

```alert("Token: " + document.body.getInnerHTML().match(/X-Plex-Token=(.*?)\"/)[1] + "\nCategory: " + location.href.match(/collections%2F(.*?)&/)[1])```

I have no clue how reliable this is - probably not very - my apologies. Anyway, once you 
get your token and category, you're good to go. Execute like so:

```node ./build/render.js --token=ab230124b --category=1234```

And you'll see it generate a picture for each entry.

## Customizing

You can completely customize the card, it's just HTML & CSS. Just edit the template.html page.

## Advanced

There's a few other options you might want to know:

- `domain` - which domain to use. Defaults to 127.0.0.1, but if you're not on the same machine as your server, you'll have to specifiy.
- `port` - defaults to 32400, but maybe yours is something else.
- `width` & `height` - defaults to 2000 by 1400.

