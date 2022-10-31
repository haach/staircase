# Staircase experiment data recorder

Deployed on [Vercel](https://staircase-recorder.vercel.app/).

## Background

This project's goal is to support the employees of the [Department of Experimental Neurology](https://expneuro.charite.de/en/) with the recording of data gathered from a behavioural test called the "staircase experiment" setup at their lab in Berlin.

### The staircase experiment

This particular experiment setup is design to test fine motor skills of small subjects such as mice or rats. The subject is placed in a transparent, elevated box which has a narrow gap along each side. Inside this gap is a small set of stairs decending into the ground. The 8 steps therefore are at an increasing distance from the base of the transparent box.

![staircase](https://user-images.githubusercontent.com/34210193/184666679-74d38505-a8a6-4441-9f35-84ba3a895fae.jpg)

During the run of the experiment the subject, which has been previously trained to this setup, will try to reach sugar pellets placed on each step using only one paw at a time. This means as a result the subject can either reach the pellet and consume it, move the pellet to a lower stair or not reach it at all.
The results of such experiments will give scientiests a better insight into the limitting foctors of fine motor bla bla

### Data structure

Previously data for each run was recorded on a sheet of paper and subsequentially entered manually into an excel sheet.

![Screenshot 2022-08-14 at 13 07 06](https://user-images.githubusercontent.com/34210193/184667968-64e53936-435c-4d53-89b8-6128ce618703.png)

Experiments frequently have around 30 subjects that will be recorded on 15 days each month. Meaning a scientiest has to enter around 450 runs for a single experiment alone. While this process is obviously very time cosuming, it also creates many oportunities for data transfer errors.

## Goals

The goal of this tool is to speed up the data recording process and offer an easy CSV export for every experiment. The scientist can setup a new experiment and add subjects to it. Each subject will have a unique ID and a set of info attached to it, like gender, geno type and chip number. To record data for an experiment the scientist can start a recording session and within this session record the data for each subject. The data will be saved in the database and can be exportet as a CSV file for further analysis.

## Preview

https://user-images.githubusercontent.com/34210193/198361915-59ad6d26-40b5-4127-ab69-6b13be002feb.mov

## Outlook

Features that are still missing for this to be functional:

- [x] A proper ui with user feedback
- [ ] Decent forms with validation
- [ ] Error handling
- [x] Authentication using SSO
- [ ] Fix authentication issues in production
- [x] Manage failing DB queries & roll back changes
- [x] CSV export
- [ ] Application tests

Nice to haves:

- [ ] Making the app a PWA and therefore allow users to install it on a device in the lab for a quick access

## Project setup

Project setup following example: https://vercel.com/guides/nextjs-prisma-postgres

The frontend uses React and Next, the Postgres database is hostedt on AWS and I am using Prisma ORM as a middleware. The Prisma Client is auto-generated and offers out of the box type-safety for the API - Check it out on [prisma.io](https://www.prisma.io/). In my case it's being run from a serverless function / Next API route hostet on Vercel.

## Deployment

Deployed on [Vercel](https://staircase-recorder.vercel.app/).

## Scripts

Starting the dev server `yarn dev`

Push the prisma schema to the db `npx prisma db push`

Starting the prisma studio on http://localhost:5555 `npx prisma studio`

Update the prisma client after a schema change `npx prisma generate`
