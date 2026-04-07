-- CreateEnum
CREATE TYPE "Result" AS ENUM ('WIN', 'LOSS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riot_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_name" TEXT NOT NULL,
    "tag_line" TEXT NOT NULL,
    "puuid" TEXT NOT NULL,
    "summoner_id" TEXT,
    "region" TEXT NOT NULL,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riot_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "champions" (
    "id" TEXT NOT NULL,
    "riot_key" TEXT NOT NULL,
    "riot_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT[],
    "image_url" TEXT NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "champions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "riot_account_id" TEXT NOT NULL,
    "riot_match_id" TEXT NOT NULL,
    "champion_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "result" "Result" NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "cs" INTEGER NOT NULL,
    "game_duration" INTEGER NOT NULL,
    "game_date" TIMESTAMP(3) NOT NULL,
    "raw_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "champion_stats" (
    "id" TEXT NOT NULL,
    "riot_account_id" TEXT NOT NULL,
    "champion_id" TEXT NOT NULL,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "avg_kills" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_deaths" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_assists" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_cs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "champion_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_simulations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ally_champion_ids" TEXT[],
    "enemy_champion_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draft_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_recommendations" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "champion_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "draft_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_notes" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "riot_accounts_puuid_key" ON "riot_accounts"("puuid");

-- CreateIndex
CREATE INDEX "riot_accounts_user_id_idx" ON "riot_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "champions_riot_key_key" ON "champions"("riot_key");

-- CreateIndex
CREATE UNIQUE INDEX "champions_riot_id_key" ON "champions"("riot_id");

-- CreateIndex
CREATE INDEX "matches_riot_account_id_idx" ON "matches"("riot_account_id");

-- CreateIndex
CREATE INDEX "matches_game_date_idx" ON "matches"("game_date");

-- CreateIndex
CREATE UNIQUE INDEX "matches_riot_account_id_riot_match_id_key" ON "matches"("riot_account_id", "riot_match_id");

-- CreateIndex
CREATE INDEX "champion_stats_riot_account_id_idx" ON "champion_stats"("riot_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "champion_stats_riot_account_id_champion_id_key" ON "champion_stats"("riot_account_id", "champion_id");

-- CreateIndex
CREATE INDEX "draft_simulations_user_id_idx" ON "draft_simulations"("user_id");

-- CreateIndex
CREATE INDEX "draft_recommendations_simulation_id_idx" ON "draft_recommendations"("simulation_id");

-- CreateIndex
CREATE INDEX "match_notes_match_id_idx" ON "match_notes"("match_id");

-- AddForeignKey
ALTER TABLE "riot_accounts" ADD CONSTRAINT "riot_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_riot_account_id_fkey" FOREIGN KEY ("riot_account_id") REFERENCES "riot_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champion_stats" ADD CONSTRAINT "champion_stats_riot_account_id_fkey" FOREIGN KEY ("riot_account_id") REFERENCES "riot_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "champion_stats" ADD CONSTRAINT "champion_stats_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_simulations" ADD CONSTRAINT "draft_simulations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_recommendations" ADD CONSTRAINT "draft_recommendations_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "draft_simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_recommendations" ADD CONSTRAINT "draft_recommendations_champion_id_fkey" FOREIGN KEY ("champion_id") REFERENCES "champions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_notes" ADD CONSTRAINT "match_notes_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_notes" ADD CONSTRAINT "match_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
