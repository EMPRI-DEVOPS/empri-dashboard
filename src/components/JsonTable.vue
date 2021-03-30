<template>
  <table class="table">
    <tbody>
      <tr v-for="(value, key) in json" :key="key">
        <th>{{ key }}</th>
        <td>{{ value }}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
    name: 'JsonTable',
    props: ['json']
}
</script>