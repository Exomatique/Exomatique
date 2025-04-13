-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "persistent" BOOLEAN NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditableLang" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "exerciseTagId" TEXT,

    PRIMARY KEY ("id", "lang"),
    CONSTRAINT "EditableLang_exerciseTagId_fkey" FOREIGN KEY ("exerciseTagId") REFERENCES "ExerciseTag" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Default Title',
    "authorId" TEXT NOT NULL,
    "visibility" INTEGER NOT NULL DEFAULT -1,
    CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "Exercise_id_fkey" FOREIGN KEY ("id") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseTag" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "ExerciseTagOnExercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exerciseId" TEXT NOT NULL,
    "ExerciseTagId" TEXT NOT NULL,
    CONSTRAINT "ExerciseTagOnExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseTagOnExercise_ExerciseTagId_fkey" FOREIGN KEY ("ExerciseTagId") REFERENCES "ExerciseTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
