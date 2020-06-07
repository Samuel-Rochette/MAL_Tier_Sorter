# Mal Tier Sorting App

This is a React application made for sorting anime from a profile on https://myanimelist.net/, and is currently hosted at https://myanimetierlist.herokuapp.com/. It was originally made to help users rate anime more consistently, but it can be used to sort anime in other ways like finding which shows on your plan to watch list are of high interest, or your least favorite anime from your dropped list. The app leverages Jikan which is an unofficial API for MAL, and is documented at https://jikan.moe/.

## How To Use

The first page of the app will prompt you for your username, and which list you would like to select from. Once the form is submitted you will be presented with a choice of two anime and you are invited to click on the one that you prefer. Afterwards you will be presented with another pair, this will continue indefinitely until the app has sorted through every possible permutation based on your input. Once The process is finished you will be presented with a sorted list of all your anime.

## Features

- Uses merge sort algorithm to minimize the number of comparisons required
- Provides an estimate for the number of comparisons needed to fully sort the list
- Can select from Completed, Watching, On Hold, Plan to Watch, and Dropped lists
- Save button which can save progress on a partially sorted list, or the results of a fully sorted list
