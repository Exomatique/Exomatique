/*
  Warnings:

  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExerciseTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExerciseTagOnExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `exerciseTagId` on the `EditableLang` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "DocumentTag" (
    "id" TEXT NOT NULL PRIMARY KEY
);

INSERT INTO "DocumentTag" ("id") SELECT "id" FROM "ExerciseTag";

-- CreateTable
CREATE TABLE "DocumentTagOnDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "DocumentId" TEXT NOT NULL,
    "DocumentTagId" TEXT NOT NULL,
    CONSTRAINT "DocumentTagOnDocument_DocumentId_fkey" FOREIGN KEY ("DocumentId") REFERENCES "Document" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentTagOnDocument_DocumentTagId_fkey" FOREIGN KEY ("DocumentTagId") REFERENCES "DocumentTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "DocumentTagOnDocument" SELECT "id", "ExerciseId" AS "DocumentId",  "ExerciseTagId" AS "DocumentTagId" FROM "ExerciseTagOnExercise";


-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Exercise";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExerciseTag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExerciseTagOnExercise";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EditableLang" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "DocumentTagId" TEXT,

    PRIMARY KEY ("id", "lang"),
    CONSTRAINT "EditableLang_DocumentTagId_fkey" FOREIGN KEY ("DocumentTagId") REFERENCES "DocumentTag" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EditableLang" ("id", "lang", "value") SELECT "id", "lang", "value" FROM "EditableLang";
DROP TABLE "EditableLang";
ALTER TABLE "new_EditableLang" RENAME TO "EditableLang";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
