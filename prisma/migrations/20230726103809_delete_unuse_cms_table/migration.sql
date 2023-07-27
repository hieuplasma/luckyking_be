/*
  Warnings:

  - You are about to drop the `cms_async_ws_call` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_email_sent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_email_sync_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_preauth_token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_setting_params` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_user_action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_user_oauth_token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cms_async_ws_call" DROP CONSTRAINT "FK_f38ac6708d79884ce99a2ca5a05";

-- DropForeignKey
ALTER TABLE "cms_preauth_token" DROP CONSTRAINT "FK_98d842825be8d1f77e29cd48413";

-- DropForeignKey
ALTER TABLE "cms_session" DROP CONSTRAINT "FK_ffb853ccef83e2b324dcef56dd0";

-- DropForeignKey
ALTER TABLE "cms_user" DROP CONSTRAINT "FK_00bf1ecf58a37ebef2575da83f9";

-- DropForeignKey
ALTER TABLE "cms_user_action" DROP CONSTRAINT "FK_dff16bed8c8ac186fcdcf44e946";

-- DropForeignKey
ALTER TABLE "cms_user_oauth_token" DROP CONSTRAINT "FK_830a95c218d36815b33ef270fe3";

-- DropTable
DROP TABLE "cms_async_ws_call";

-- DropTable
DROP TABLE "cms_email_sent";

-- DropTable
DROP TABLE "cms_email_sync_status";

-- DropTable
DROP TABLE "cms_preauth_token";

-- DropTable
DROP TABLE "cms_session";

-- DropTable
DROP TABLE "cms_setting_params";

-- DropTable
DROP TABLE "cms_user";

-- DropTable
DROP TABLE "cms_user_action";

-- DropTable
DROP TABLE "cms_user_oauth_token";
