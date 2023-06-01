-- CreateTable
CREATE TABLE "cms_async_ws_call" (
    "id" SERIAL NOT NULL,
    "public_id" VARCHAR(128) NOT NULL,
    "action" VARCHAR(256) NOT NULL,
    "object_type" VARCHAR(256),
    "object_id" INTEGER,
    "finished" SMALLINT NOT NULL DEFAULT 0,
    "error_code" SMALLINT NOT NULL DEFAULT 0,
    "error_message" VARCHAR(512),
    "result" JSONB,
    "caller_id" INTEGER NOT NULL,
    "expired_dt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "PK_15b793d3960fa11f3f8f7506348" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_email_sent" (
    "id" SERIAL NOT NULL,
    "email_type" SMALLINT NOT NULL DEFAULT 1,
    "linked_object_id" INTEGER,
    "from" VARCHAR(128) NOT NULL,
    "subject" VARCHAR(512) NOT NULL,
    "to" VARCHAR(1024) NOT NULL,
    "content" TEXT NOT NULL,
    "bounced_addrs" VARCHAR[],
    "transport_message_id" VARCHAR(128) NOT NULL,
    "delivery_status" SMALLINT NOT NULL DEFAULT 0,
    "spam_reported" SMALLINT NOT NULL DEFAULT 0,
    "creation_dt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_dt" TIMESTAMPTZ(0),

    CONSTRAINT "PK_0be963060a9425507c6811155f1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_email_sync_status" (
    "id" SERIAL NOT NULL,
    "sync_state" INTEGER NOT NULL DEFAULT 0,
    "last_sync_dt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_19af2e747284dddd9a4e7c86ab4" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_preauth_token" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "expire_dt" TIMESTAMPTZ(0) NOT NULL,
    "token" VARCHAR(64),

    CONSTRAINT "PK_ebde5965241921429cca4346476" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_session" (
    "id" SERIAL NOT NULL,
    "session_id" VARCHAR NOT NULL,
    "access_token" VARCHAR(512) NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "PK_937809889a2847c92d365ce194a" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_setting_params" (
    "id" SERIAL NOT NULL,
    "auto_approve" TEXT[] DEFAULT ARRAY['keno']::TEXT[],

    CONSTRAINT "PK_3e818b3d36c328ab91fb6a22a33" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "phone_number" VARCHAR(32),
    "first_name" VARCHAR(128),
    "last_name" VARCHAR(128) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "confirmation_token" VARCHAR(128),
    "salt" VARCHAR(255) NOT NULL,
    "enabled" SMALLINT NOT NULL DEFAULT 0,
    "user_type" SMALLINT NOT NULL DEFAULT 1,
    "confirmation_email_id" INTEGER,
    "last_login" TIMESTAMPTZ(0),
    "creation_dt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_requested_at" TIMESTAMPTZ(0),

    CONSTRAINT "PK_1e641dd45089529dc60ab0d3176" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_user_action" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action_dt" TIMESTAMPTZ(0) NOT NULL,
    "action" VARCHAR(255),
    "object" VARCHAR[],
    "object_ids" VARCHAR[],
    "detail" JSONB NOT NULL,

    CONSTRAINT "PK_0cbf3a6ad3eb92d1bc939ab08a7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_user_oauth_token" (
    "id" SERIAL NOT NULL,
    "oauth_provider" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" VARCHAR(2048) NOT NULL,
    "refresh_token" VARCHAR(2048),
    "access_token_deadline" TIMESTAMPTZ(0),

    CONSTRAINT "PK_68ac18e4ebeef5b1a69ed58f3e2" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_98d842825be8d1f77e29cd4841" ON "cms_preauth_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_unique_idx" ON "cms_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_830a95c218d36815b33ef270fe3" ON "cms_user_oauth_token"("user_id");

-- AddForeignKey
ALTER TABLE "cms_async_ws_call" ADD CONSTRAINT "FK_f38ac6708d79884ce99a2ca5a05" FOREIGN KEY ("caller_id") REFERENCES "cms_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cms_preauth_token" ADD CONSTRAINT "FK_98d842825be8d1f77e29cd48413" FOREIGN KEY ("user_id") REFERENCES "cms_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cms_session" ADD CONSTRAINT "FK_ffb853ccef83e2b324dcef56dd0" FOREIGN KEY ("user_id") REFERENCES "cms_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cms_user" ADD CONSTRAINT "FK_00bf1ecf58a37ebef2575da83f9" FOREIGN KEY ("confirmation_email_id") REFERENCES "cms_email_sent"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cms_user_action" ADD CONSTRAINT "FK_dff16bed8c8ac186fcdcf44e946" FOREIGN KEY ("user_id") REFERENCES "cms_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cms_user_oauth_token" ADD CONSTRAINT "FK_830a95c218d36815b33ef270fe3" FOREIGN KEY ("user_id") REFERENCES "cms_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

