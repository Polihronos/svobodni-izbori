<script lang="ts">
  let isSignUp = false;
</script>

<div class="flex items-center justify-center min-h-screen bg-base-200">
  <form method="POST" class="card w-full max-w-sm bg-base-100 shadow-xl card-body space-y-4">
    <h2 class="card-title justify-center">{isSignUp ? 'Регистрация' : 'Вход'}</h2>

    <!-- These inputs are only required for email/password login/signup -->
    <label class="form-control">
      <div class="label">
        <span class="label-text">Имейл</span>
      </div>
      <input name="email" type="email" required class="input input-bordered focus:outline-none" placeholder="you@example.com" />
    </label>

    <label class="form-control">
      <div class="label">
        <span class="label-text">Парола</span>
      </div>
      <input name="password" type="password" required class="input input-bordered focus:outline-none" placeholder="••••••••" />
    </label>

    <div class="card-actions flex-col space-y-2 pt-2">
      <!-- This button WILL trigger validation -->
      <button
        class="btn btn-primary w-full"
        type="submit"
        formaction={isSignUp ? '?/signup' : '?/login'}
      >
        {isSignUp ? 'Създай профил' : 'Влез'}
      </button>

      <!-- This button WILL NOT trigger validation because of formnovalidate -->
      <button
        class="btn btn-outline w-full"
        type="submit"
        formaction="?/google"
        formnovalidate
      >
        Влез с Google
      </button>

      <div class="divider">ИЛИ</div>
      
      <button
        type="button"
        class="btn btn-ghost w-full"
        on:click={() => (isSignUp = !isSignUp)}
      >
        {isSignUp ? 'Вече имаш профил? Влез' : 'Нов тук? Регистрирай се'}
      </button>
      
    </div>
  </form>
</div>