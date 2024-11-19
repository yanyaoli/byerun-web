<template>
  <el-header>
    <h1>免责声明</h1>
  </el-header>
  <el-main>
    <el-form class="DisclaimerForm">
      <el-space direction="vertical" class="scrollable-space">
        <el-text tag="h4" size="medium">1. <b>用途限制</b></el-text>
        <el-text size="small"
          >本项目的代码和功能仅供个人学习、技术研究和非商业性用途。任何违反本项目使用条款的行为，开发者不承担任何责任。</el-text
        >

        <el-text tag="h4" size="medium">2. <b>数据安全</b></el-text>
        <el-text size="small"
          >本项目要求用户提供个人账号和密码等敏感信息。用户应当对自己的账号和密码的安全性负责。开发者不对由于用户提供错误信息、泄露或未经授权使用信息导致的任何损失或法律责任承担责任。</el-text
        >
        <el-text size="small"
          >请确保使用该项目时，不泄露个人信息，避免使用相同的密码与其他重要账户绑定。</el-text
        >
        <el-text size="small">用户应当定期修改密码，确保账号安全。</el-text>

        <el-text tag="h4" size="medium">3. <b>法律责任</b></el-text>
        <el-text size="small"
          >用户在使用本项目过程中，应遵守适用的法律法规，并承担因使用本项目产生的所有风险。用户不得通过本项目从事任何非法活动，开发者对于用户违法行为不承担任何责任。</el-text
        >

        <el-text tag="h4" size="medium">4. <b>免责条款</b></el-text>
        <el-text size="small"
          >开发者对于因使用本项目而产生的任何直接或间接损失等不承担责任，使用本项目的所有风险由用户自行承担，开发者不对因项目使用过程中出现的任何问题或技术故障负责。</el-text
        >

        <el-text tag="h4" size="medium">5. <b>服务中断与项目终止</b></el-text>
        <el-text size="small"
          >开发者保留随时修改、暂停或终止本项目的权利。由于不可预见的技术问题或其他原因，项目可能出现服务中断或暂停，开发者不对此类中断或暂停负责。</el-text
        >

        <el-text tag="h4" size="medium">6. <b>隐私保护</b></el-text>
        <el-text size="small"
          >本项目不会主动收集用户的个人信息，不对用户自行公开隐私信息的行为负责，包含但不限于：因自行部署而将配置文件或环境变量等信息公布在与本项目有关的Issues或Pull
          requests中。</el-text
        >

        <el-text tag="h4" size="medium">7. <b>第三方服务</b></el-text>
        <el-text size="small"
          >本项目可能与第三方服务进行集成。对于这些第三方服务提供商的服务质量、稳定性或安全性，开发者不做任何保证。使用这些服务时，用户应当遵循第三方服务商的相关条款。</el-text
        >

        <el-text tag="h4" size="medium">8. <b>修改与更新</b></el-text>
        <el-text size="small"
          >开发者有权根据需要修改、更新或停止本项目的任何部分。所有更新和修改将发布在项目的相关平台或存储库，用户应定期查看并遵守最新版本的使用条款。</el-text
        >

        <el-text tag="h4" size="medium">9. <b>终止使用</b></el-text>
        <el-text size="small"
          >用户可以随时停止使用本项目。如果用户不同意本免责声明中的任何条款，或在使用过程中遇到不适应的内容，应立即停止使用该项目。</el-text
        >
      </el-space>
      <el-button type="primary" @click="$emit('closeDisclaimer')"
        >返回登录</el-button
      >
    </el-form>
  </el-main>
</template>

<script setup>
</script>

<style scoped>
.DisclaimerForm {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  margin: auto;
}

.scrollable-space {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: none;
}
</style>