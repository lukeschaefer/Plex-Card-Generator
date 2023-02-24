# Plex-to-image

## About

This is a small script you can use to turn a Plex collection into a series of images, 
which includes their poster and text description. I used this to make a deck of cards
out of my "Horror Movies" collection - this way I can pick one at random from the cards.

It's **really hacky** since I made it in a weekend. I probably won't be improving this script any
more, unless I make another deck of cards in the future - but I figured I'd put this up
in case anyone wanted to use it.

## How to use

Install via npm with:

```npm install -g plex-to-image```

Before you run the command - you need to have a valid **plex token** and **category id**.
When I wrote this program - I got those from snooping around the Plex web pages in devtools,
but here's a little utility for you - go to the collection you want to export, open up DevTools,
and paste this into the console:

```alert("Token: " + document.body.getInnerHTML().match(/X-Plex-Token=(.*?)\"/)[1] + "\nCategory: " + location.href.match(/collections%2F(.*?)&/)[1])```

I have no clue how reliable this is - probably not very - my apologies. Anyway, once you 
get your token and category, you're good to go. Execute like so:

```plex-to-image --token=ab230124b --category=1234```

And you'll see it generate a picture for each entry.

## Advanced

There's a few other options you might want to know:

- `domain` - which domain to use. Defaults to 127.0.0.1, but if you're not on the same machine as your server, you'll have to specifiy.
- `port` - defaults to 32400, but maybe yours is something else.
- `width` & `height` - defaults to 2000 by 1400.

