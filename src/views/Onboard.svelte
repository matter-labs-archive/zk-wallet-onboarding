<script lang="ts">
  import WalletSelect from '~/WalletSelect.svelte'
  import WalletCheck from '~/WalletCheck.svelte'
  import accountSelect from '~/modules/check/accounts'
  import derivationPath from '~/modules/check/derivation-path'
  import { app } from "~/stores"

  import {
    WalletSelectModule,
    WalletSelectFunction
  } from "~/interfaces"

  export let walletSelectModule: WalletSelectModule
  export let walletSelect: WalletSelectFunction
</script>


{#if $app.walletSelectInProgress}
  <WalletSelect module={walletSelectModule} />
{/if}

{#if $app.walletCheckInProgress}
  <WalletCheck {walletSelect} />
{/if}

{#if $app.accountSelectInProgress}
  <WalletCheck modules={[derivationPath(), accountSelect()]} />
{/if}