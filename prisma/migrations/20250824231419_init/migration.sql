-- CreateTable
CREATE TABLE "public"."characters" (
    "id" TEXT NOT NULL,
    "traditional" TEXT NOT NULL,
    "simplified" TEXT,
    "jyutping" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "stroke_count" INTEGER NOT NULL,
    "frequency" INTEGER,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stroke_patterns" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "stroke_order" INTEGER NOT NULL,
    "path_data" JSONB NOT NULL,
    "stroke_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stroke_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercises" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "total_strokes" INTEGER NOT NULL,
    "jyutping" TEXT,
    "english" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exercise_characters" (
    "id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "exercise_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "is_guest" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."practice_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_exercise_index" INTEGER NOT NULL DEFAULT 0,
    "current_character_index" INTEGER NOT NULL DEFAULT 0,
    "overall_accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_time_spent" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."practice_attempts" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "character_id" TEXT,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "stroke_data" JSONB,
    "canvas_snapshot" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "difficultyLevel" INTEGER NOT NULL DEFAULT 1,
    "accuracy_history" JSONB NOT NULL DEFAULT '[]',
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" TIMESTAMP(3),
    "next_review" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "characters_traditional_key" ON "public"."characters"("traditional");

-- CreateIndex
CREATE UNIQUE INDEX "stroke_patterns_character_id_stroke_order_key" ON "public"."stroke_patterns"("character_id", "stroke_order");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_characters_exercise_id_character_id_order_index_key" ON "public"."exercise_characters"("exercise_id", "character_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_character_id_key" ON "public"."user_progress"("user_id", "character_id");

-- AddForeignKey
ALTER TABLE "public"."stroke_patterns" ADD CONSTRAINT "stroke_patterns_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_characters" ADD CONSTRAINT "exercise_characters_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exercise_characters" ADD CONSTRAINT "exercise_characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practice_attempts" ADD CONSTRAINT "practice_attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practice_attempts" ADD CONSTRAINT "practice_attempts_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
